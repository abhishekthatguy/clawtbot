"""
ClawtBot — Agent 5: Publisher Bot
Publishes content to social media platforms via their APIs.
Handles error retry with exponential backoff.
"""

import logging
from datetime import datetime, timedelta
from typing import Any, Dict

from agents.base_agent import BaseAgent
from cron_config import ENGAGEMENT_DELAY_HOURS

logger = logging.getLogger(__name__)

MAX_RETRY_COUNT = 3


class PublisherBot(BaseAgent):
    """
    Agent 5 — Publisher Bot

    Takes scheduled content and publishes to the appropriate platform APIs.
    Queues the Engagement Bot to run after ENGAGEMENT_DELAY_HOURS.
    """

    def __init__(self):
        super().__init__("PublisherBot")

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        self.log_start(input_data)

        from sqlalchemy import select
        from db.database import async_session
        from db.models import Schedule, Content, ContentStatus

        published_count = 0
        failed_count = 0
        results = []

        try:
            async with async_session() as session:
                # Fetch scheduled items that haven't been published
                query = select(Schedule).where(
                    Schedule.is_published == False,
                    Schedule.retry_count < MAX_RETRY_COUNT,
                )
                result = await session.execute(query)
                schedules = result.scalars().all()

                for schedule in schedules:
                    # Load the content
                    content_result = await session.execute(
                        select(Content).where(Content.id == schedule.content_id)
                    )
                    content = content_result.scalar_one_or_none()
                    if not content:
                        continue

                    try:
                        # Get the platform client and publish
                        platform_client = await self._get_platform_client(schedule.platform.value)

                        if platform_client is None:
                            self.logger.warning(
                                f"Platform {schedule.platform.value} not configured, skipping"
                            )
                            results.append({
                                "content_id": str(content.id),
                                "platform": schedule.platform.value,
                                "status": "skipped",
                                "reason": "Platform not configured",
                            })
                            continue

                        # Build the post text with hashtags
                        post_text = content.improved_text or content.post_text or content.caption
                        hashtags = ""
                        if content.niche_hashtags:
                            hashtags += " ".join(content.niche_hashtags)
                        if content.broad_hashtags:
                            hashtags += " " + " ".join(content.broad_hashtags)
                        full_text = f"{post_text}\n\n{hashtags}".strip()

                        # Publish
                        post_id = await platform_client.publish(text=full_text)

                        # Update schedule
                        schedule.is_published = True
                        schedule.published_at = datetime.utcnow()
                        schedule.platform_post_id = post_id

                        # Update content status
                        content.status = ContentStatus.PUBLISHED

                        published_count += 1
                        results.append({
                            "content_id": str(content.id),
                            "platform": schedule.platform.value,
                            "status": "published",
                            "post_id": post_id,
                        })

                        self.logger.info(
                            f"Published content {content.id} to {schedule.platform.value}"
                        )

                        # Queue engagement bot for later
                        self._queue_engagement_check(
                            content_id=str(content.id),
                            platform=schedule.platform.value,
                            post_id=post_id,
                        )

                    except Exception as e:
                        schedule.retry_count += 1
                        schedule.error_message = str(e)

                        if schedule.retry_count >= MAX_RETRY_COUNT:
                            content.status = ContentStatus.FAILED

                        failed_count += 1
                        results.append({
                            "content_id": str(content.id),
                            "platform": schedule.platform.value,
                            "status": "failed",
                            "error": str(e),
                            "retry_count": schedule.retry_count,
                        })
                        self.logger.error(
                            f"Failed to publish content {content.id}: {e}"
                        )

                await session.commit()

        except Exception as e:
            self.log_error(e)
            raise

        output = {
            "published_count": published_count,
            "failed_count": failed_count,
            "results": results,
        }
        self.log_complete(output)
        return output

    async def _get_platform_client(self, platform: str):
        """
        Get the platform API client.
        Loads credentials from DB (Settings UI) first, then falls back to .env.
        Returns None if no credentials are found.
        """
        from utils.credential_loader import get_platform_credentials

        creds = await get_platform_credentials(platform)
        if not creds:
            self.logger.warning(f"No credentials found for {platform} (checked DB + .env)")
            return None

        if platform == "facebook":
            from platforms.facebook import FacebookClient
            if creds.get("access_token") and creds.get("page_id"):
                return FacebookClient(
                    access_token=creds["access_token"],
                    page_id=creds["page_id"],
                )

        elif platform == "instagram":
            from platforms.instagram import InstagramClient
            if creds.get("access_token") and creds.get("business_account_id"):
                return InstagramClient(
                    access_token=creds["access_token"],
                    business_account_id=creds["business_account_id"],
                )

        elif platform == "twitter":
            from platforms.twitter import TwitterClient
            if creds.get("api_key") and creds.get("api_secret"):
                return TwitterClient(
                    api_key=creds.get("api_key"),
                    api_secret=creds.get("api_secret"),
                    access_token=creds.get("access_token"),
                    access_token_secret=creds.get("access_token_secret"),
                    bearer_token=creds.get("bearer_token"),
                )

        elif platform == "youtube":
            from platforms.youtube import YouTubeClient
            if creds.get("api_key"):
                return YouTubeClient(
                    api_key=creds.get("api_key"),
                    client_id=creds.get("client_id"),
                    client_secret=creds.get("client_secret"),
                    refresh_token=creds.get("refresh_token"),
                )

        self.logger.warning(f"Credentials found for {platform} but required keys are missing")
        return None

    def _queue_engagement_check(self, content_id: str, platform: str, post_id: str):
        """Queue the engagement bot to run after the configured delay."""
        try:
            from celery_app import celery_app
            celery_app.send_task(
                "agents.engagement_bot.run_engagement_check",
                args=[content_id, platform, post_id],
                countdown=ENGAGEMENT_DELAY_HOURS * 3600,  # Convert hours to seconds
            )
            self.logger.info(
                f"Queued engagement check for {content_id} in {ENGAGEMENT_DELAY_HOURS}h"
            )
        except Exception as e:
            self.logger.warning(f"Failed to queue engagement check: {e}")
