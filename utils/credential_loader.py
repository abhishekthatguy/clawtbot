"""
ClawtBot — Platform Credential Loader
Loads platform credentials from the database (saved via Settings UI)
with fallback to .env config. This bridges the gap between the UI-saved
credentials and the platform clients used by the publisher bot.
"""

import logging
from typing import Dict, Optional

from utils.crypto import decrypt_dict

logger = logging.getLogger(__name__)


async def load_platform_credentials(platform: str) -> Optional[Dict[str, str]]:
    """
    Load decrypted platform credentials from the database.

    Looks for ANY active credential for the given platform.
    Returns decrypted key-value dict, or None if not found.
    """
    from sqlalchemy import select
    from db.database import async_session
    from db.settings_models import PlatformCredential
    from db.models import Platform as PlatformEnum

    try:
        async with async_session() as session:
            result = await session.execute(
                select(PlatformCredential).where(
                    PlatformCredential.platform == PlatformEnum(platform),
                    PlatformCredential.is_active == True,
                )
            )
            cred = result.scalar_one_or_none()

            if cred and cred.encrypted_credentials:
                decrypted = decrypt_dict(cred.encrypted_credentials)
                # Filter out empty values
                decrypted = {k: v for k, v in decrypted.items() if v}
                if decrypted:
                    logger.info(f"Loaded {platform} credentials from database (keys: {list(decrypted.keys())})")
                    return decrypted

    except Exception as e:
        logger.error(f"Failed to load {platform} credentials from database: {e}")

    return None


def _env_facebook_credentials() -> Optional[Dict[str, str]]:
    """Fallback: load Facebook credentials from .env config."""
    from config import settings
    if settings.facebook_access_token and settings.facebook_page_id:
        return {
            "access_token": settings.facebook_access_token,
            "page_id": settings.facebook_page_id,
        }
    return None


def _env_instagram_credentials() -> Optional[Dict[str, str]]:
    """Fallback: load Instagram credentials from .env config."""
    from config import settings
    if settings.instagram_access_token and settings.instagram_business_account_id:
        return {
            "access_token": settings.instagram_access_token,
            "business_account_id": settings.instagram_business_account_id,
        }
    return None


def _env_twitter_credentials() -> Optional[Dict[str, str]]:
    """Fallback: load Twitter credentials from .env config."""
    from config import settings
    if settings.twitter_api_key and settings.twitter_api_secret:
        return {
            "api_key": settings.twitter_api_key,
            "api_secret": settings.twitter_api_secret,
            "access_token": settings.twitter_access_token,
            "access_token_secret": settings.twitter_access_token_secret,
            "bearer_token": settings.twitter_bearer_token,
        }
    return None


def _env_youtube_credentials() -> Optional[Dict[str, str]]:
    """Fallback: load YouTube credentials from .env config."""
    from config import settings
    if settings.youtube_api_key:
        return {
            "api_key": settings.youtube_api_key,
            "client_id": settings.youtube_client_id,
            "client_secret": settings.youtube_client_secret,
            "refresh_token": settings.youtube_refresh_token,
        }
    return None


_ENV_FALLBACKS = {
    "facebook": _env_facebook_credentials,
    "instagram": _env_instagram_credentials,
    "twitter": _env_twitter_credentials,
    "youtube": _env_youtube_credentials,
}


async def get_platform_credentials(platform: str) -> Optional[Dict[str, str]]:
    """
    Get credentials for a platform.
    Priority: Database (UI settings) → .env file → None
    """
    # Try database first (UI-saved credentials)
    db_creds = await load_platform_credentials(platform)
    if db_creds:
        return db_creds

    # Fallback to .env config
    env_fallback = _ENV_FALLBACKS.get(platform)
    if env_fallback:
        env_creds = env_fallback()
        if env_creds:
            logger.info(f"Using {platform} credentials from .env config (fallback)")
            return env_creds

    logger.warning(f"No credentials found for {platform} (neither DB nor .env)")
    return None
