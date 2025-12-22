from django.urls import path
from rest_framework.routers import DefaultRouter

from .password_reset_views import PasswordResetConfirmView, PasswordResetRequestView
from .views import RegisterView, UserViewSet, ProfileViewSet, add_user_api, created_users_api, me_api, profile_choices_api, upload_users_excel_api

authentication_router = DefaultRouter()
authentication_router.register(r'profile', ProfileViewSet, basename='profile')
authentication_router.register(r'users', UserViewSet, basename='users')

urlpatterns = [
    # Router URLs
    *authentication_router.urls,

    # Password reset endpoints
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('superuser/add-user/', add_user_api, name='add_user_api'),
    path('superuser/upload-users/', upload_users_excel_api, name='upload_users_excel_api'),
    path('me/', me_api, name='me'),
    path("profile-choices/", profile_choices_api),
    path("superuser/created-users/", created_users_api),

]
