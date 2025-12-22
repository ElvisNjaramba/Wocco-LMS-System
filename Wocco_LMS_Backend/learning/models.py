from django.db import models
from django.utils.text import slugify
from django.contrib.auth.models import User

# --------------------------------
# Universal Module Titles
# --------------------------------
class ModuleTitle(models.Model):
    title = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title

# --------------------------------
# Position-specific Module Details
# --------------------------------
class Module(models.Model):
    title_ref = models.ForeignKey(ModuleTitle, on_delete=models.CASCADE, related_name="position_modules")
    position = models.CharField(max_length=50)  # matches Profile.title
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("title_ref", "position")
        ordering = ['order']  # ensures default ordering by order

    def save(self, *args, **kwargs):
        if self.order == 0:
            # get max order for this position
            max_order = Module.objects.filter(position=self.position).aggregate(models.Max('order'))['order__max'] or 0
            self.order = max_order + 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title_ref.title} ({self.position})"


# --------------------------------
# Pages inside position-specific modules
# --------------------------------
class ModulePage(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="pages")
    title = models.CharField(max_length=150)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]

    def save(self, *args, **kwargs):
        if self.order == 0:
            max_order = ModulePage.objects.filter(module=self.module).aggregate(models.Max('order'))['order__max'] or 0
            self.order = max_order + 1
        super().save(*args, **kwargs)


# --------------------------------
# Page progress tracking
# --------------------------------
class PageProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    page = models.ForeignKey(ModulePage, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)

    class Meta:
        unique_together = ("user", "page")

# --------------------------------
# Quiz Questions
# --------------------------------
class Question(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='questions')
    text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_option = models.CharField(
        max_length=1,
        choices=[('A','A'),('B','B'),('C','C'),('D','D')]
    )

    def __str__(self):
        return self.text[:50]

# --------------------------------
# User progress per module
# --------------------------------
class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    module = models.ForeignKey(Module, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'module')


class FinalQuizProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    completed = models.BooleanField(default=False)
    score = models.IntegerField(default=0)
    timestamp = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user',)
