from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# --------------------------------------
# Position and Department as separate models
# --------------------------------------
class Position(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

# --------------------------------------
# User Profile
# --------------------------------------
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=100, blank=True, null=True)
    image = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.TextField(max_length=200, blank=True, null=True)

    # New: FK to Position and Department
    title = models.ForeignKey(
        Position,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )
    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
    )

    def __str__(self):
        return self.user.username

# Signal to create/update Profile automatically
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        Profile.objects.get_or_create(user=instance)

# --------------------------------------
# Store generated credentials
# --------------------------------------
class CreatedUserCredential(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=150)
    temp_password = models.CharField(max_length=50)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_users"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username
