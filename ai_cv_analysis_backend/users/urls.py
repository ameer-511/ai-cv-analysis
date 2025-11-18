from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
# Register at the empty prefix since project urls already includes this file under /api/users/
router.register(r'', UserViewSet, basename='users')

urlpatterns = router.urls
