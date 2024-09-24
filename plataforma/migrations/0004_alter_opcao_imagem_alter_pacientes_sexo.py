# Generated by Django 5.0.6 on 2024-06-16 02:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('plataforma', '0003_refeicao_opcao'),
    ]

    operations = [
        migrations.AlterField(
            model_name='opcao',
            name='imagem',
            field=models.ImageField(upload_to='opcion'),
        ),
        migrations.AlterField(
            model_name='pacientes',
            name='sexo',
            field=models.CharField(choices=[('F', 'Femenino'), ('M', 'Masculino')], max_length=1),
        ),
    ]