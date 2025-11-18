# Generated migration for adding current_question_index field

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cv_analysis', '0004_interviewquestion_user_answer_interview_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='interview',
            name='current_question_index',
            field=models.IntegerField(default=0),
        ),
    ]
