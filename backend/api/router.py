"""
API Router — aggregates all sub-routers.
"""

from fastapi import APIRouter
from api.endpoints.environments import router as env_router
from api.endpoints.sessions import router as sessions_router
from api.endpoints.live_data import router as live_router
from api.endpoints.settings import router as settings_router

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(env_router)
api_router.include_router(sessions_router)
api_router.include_router(live_router)
api_router.include_router(settings_router)
