from rest_framework import serializers
from .models import Module, ModulePage, Question, UserProgress
from django.db.models.functions import Lower, Trim

class ModuleSerializer(serializers.ModelSerializer):
    completed = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ['id', 'description', 'order', 'completed']

    def get_completed(self, obj):
        user = self.context['request'].user
        progress, _ = UserProgress.objects.get_or_create(
            user=user,
            module=obj
        )
        return progress.completed


class ModulePageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModulePage
        fields = ["id", "title", "content", "order"]


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        exclude = ['correct_option']  # never expose answer


class ProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'
