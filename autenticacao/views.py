import os
from hashlib import sha256

from django.conf import settings
from django.contrib import auth
from django.contrib import messages
from django.contrib.auth.models import User
from django.contrib.messages import constants
from django.shortcuts import render, redirect, get_object_or_404

from .models import Ativacao
from .utils import password_is_valid, email_html


def cadastro(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return redirect('/')
        else:
            return render(request, 'cadastro.html')
    elif request.method == "POST":
        username = request.POST.get('usuario')
        email = request.POST.get('email')
        senha = request.POST.get('senha')
        confirmar_senha = request.POST.get('confirmar_senha')

        if not password_is_valid(request, senha, confirmar_senha):
            return redirect('/auth/cadastro')

        # TODO: Verificar se username é único

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=senha,
                is_active=False
            )
            user.save()

            token = sha256(f"{username}{email}".encode()).hexdigest()
            ativacao = Ativacao(token=token, user=user)
            ativacao.save()

            path_template = os.path.join(
                settings.BASE_DIR,
                'autenticacao/templates/emails/cadastro_confirmado.html'
            )
            email_html(
                path_template,
                'Registro Exitoso',
                [email, ],
                username=username,
                link_ativacao=f"127.0.0.1:8000/auth/ativar_conta/{token}"
            )

            messages.add_message(request, constants.SUCCESS, 'Usuario Registrado Exitosamente')
            return redirect('/auth/logar')
        except:
            messages.add_message(request, constants.ERROR, 'Error interno del sistema')
            return redirect('/auth/cadastro')


def logar(request):
    if request.method == "GET":
        if request.user.is_authenticated:
            return redirect('/')
        else:
            return render(request, 'logar.html')
    elif request.method == "POST":
        username = request.POST.get('usuario')
        senha = request.POST.get('senha')

        usuario = auth.authenticate(username=username, password=senha)
        if not usuario:
            messages.add_message(request, constants.ERROR, 'Usuario o Contraseña Invalido')
            return redirect('/auth/logar')
        else:
            auth.login(request, usuario)
            return redirect('/pacientes')


def sair(request):
    auth.logout(request)
    return redirect('/auth/logar')


def ativar_conta(request, token):
    token = get_object_or_404(Ativacao, token=token)

    if token.ativo:
        messages.add_message(request, constants.WARNING, 'Este token ya ha sido utilizado.')
        return redirect('/auth/logar')

    user = User.objects.get(username=token.user.username)
    user.is_active = True
    user.save()

    token.ativo = True
    token.save()

    messages.add_message(request, constants.SUCCESS, 'Cuenta creada exitosamente')
    return redirect('/auth/logar')
