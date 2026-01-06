from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from authentication.urls import authentication_router
from learning.urls import learning_router
from authentication.views import RegisterView

router = DefaultRouter()
router.registry.extend(authentication_router.registry)
router.registry.extend(learning_router.registry)

urlpatterns = [
    path('admin/', admin.site.urls),

    path('', include(router.urls)),

    # Auth-related endpoints
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('api/', include('authentication.urls')),
    path('api/', include('learning.urls')),

]

# Media file serving in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
