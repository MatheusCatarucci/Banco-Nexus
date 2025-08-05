import os
import firebase_admin
from firebase_admin import credentials, firestore

# Configurar Firebase Firestore
cred = credentials.Certificate('firebase-credentials.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

def limpar_tela():
    os.system('cls' if os.name == 'nt' else 'clear')

def pausa():
    input('Digite ENTER para continuar... ')

# Funções para acessar Firestore

def carregar_usuarios():
    usuarios = {}
    docs = db.collection('usuarios').stream()
    for doc in docs:
        usuarios[doc.id] = doc.to_dict()
    return usuarios

def salvar_usuario(cpf, dados):
    db.collection('usuarios').document(cpf).set(dados)

def existe_usuario(cpf):
    doc = db.collection('usuarios').document(cpf).get()
    return doc.exists

def carregar_usuario(cpf):
    doc = db.collection('usuarios').document(cpf).get()
    if doc.exists:
        return doc.to_dict()
    return None

# Função cartão integrada

def ver_cartao(cpf):
    while True:
        limpar_tela()
        usuario = carregar_usuario(cpf)
        if not usuario or 'cartao' not in usuario:
            print('Cartão não disponível para este usuário.')
            pausa()
            break

        cartao = usuario['cartao']
        print('===== CARTÃO DE CRÉDITO =====')
        print(f"Limite Total: R${cartao['limite_total']:.2f}")
        print(f"Limite Disponível: R${cartao['limite_disponivel']:.2f}")
        print(f"Fatura Atual: R${cartao['fatura']:.2f}")
        print('\n1 - Pagar Fatura')
        print('2 - Voltar')
        opcao = input('Escolha uma opção: ')

        if opcao == '1':
            if cartao['fatura'] == 0:
                print('Nenhuma fatura pendente!')
            else:
                saldo_disponivel = usuario['saldo']
                if saldo_disponivel >= cartao['fatura']:
                    usuario['saldo'] -= cartao['fatura']
                    cartao['limite_disponivel'] += cartao['fatura']
                    cartao['fatura'] = 0
                    salvar_usuario(cpf, usuario)
                    print('Fatura paga com sucesso!')
                else:
                    print('Saldo insuficiente para pagar a fatura.')
            pausa()

        elif opcao == '2':
            break
        else:
            print('Opção inválida.')
            pausa()

# Outras funções já existentes

def fazer_pix(cpf):
    while True:
        limpar_tela()
        print('===== NEXUS PAY =====')
        cpf_destino = input('Digite a chave CPF do destinatário\nDigite zero para sair \n-->')
        if cpf_destino == '0':
            break

        user_origem = carregar_usuario(cpf)
        user_destino = carregar_usuario(cpf_destino)
        if user_destino and cpf_destino != cpf:
            valor_pix = float(input('Digite o valor da transferência\n--> '))
            if valor_pix <= user_origem['saldo']:
                user_origem['saldo'] -= valor_pix
                user_destino['saldo'] += valor_pix
                salvar_usuario(cpf, user_origem)
                salvar_usuario(cpf_destino, user_destino)
                limpar_tela()
                print(f'Pix de R${valor_pix:.2f} enviado com sucesso para {user_destino["nome"]}!')
                pausa()
                break
            else:
                print('Saldo insuficiente para transação')
                pausa()
        else:
            print('CPF de destino não encontrado.')
            pausa()

def investimento(cpf):
    while True:
        limpar_tela()
        print('===== INVESTIMENTO =====')
        print('CDB Liquidez Diária')
        user = carregar_usuario(cpf)
        print(f"Saldo atual: R${user['saldo']:.2f}")
        print(f"Saldo no CDB: R${user['saldo_cdb']:.2f}")
        print('1 - Depósito')
        print('2 - Saque')
        print('3 - Voltar')
        op_investimento = input('Escolha uma opção\n--> ')

        if op_investimento == '1':
            limpar_tela()
            print('===== DEPÓSITO CDB =====')
            valor_deposito = float(input('Digite o valor do depósito\nR$--> '))
            if valor_deposito <= user['saldo']:
                user['saldo_cdb'] += valor_deposito
                user['saldo'] -= valor_deposito
                salvar_usuario(cpf, user)
                limpar_tela()
                print('Depósito realizado com sucesso!')
            else:
                limpar_tela()
                print('Saldo insuficiente para depósito.')
            pausa()

        elif op_investimento == '2':
            limpar_tela()
            print('===== SAQUE CDB =====')
            valor_saque = float(input('Digite o valor do saque\nR$--> '))
            if valor_saque <= user['saldo_cdb']:
                user['saldo_cdb'] -= valor_saque
                user['saldo'] += valor_saque
                salvar_usuario(cpf, user)
                limpar_tela()
                print('Saque realizado com sucesso!')
            else:
                limpar_tela()
                print('Saldo insuficiente no CDB.')
            pausa()

        elif op_investimento == '3':
            break
        else:
            limpar_tela()
            print('Opção inválida.')
            pausa()

def cadastro():
    limpar_tela()
    print('===== CADASTRO NEXUS =====')
    nome = input('Digite seu nome\n--> ')
    cpf = input('Digite um CPF para cadastrar\n--> ')
    senha = input('Digite uma senha boa\n--> ')

    if existe_usuario(cpf):
        print('CPF já cadastrado!')
        pausa()
        return

    usuario = {
        "nome": nome,
        "senha": senha,
        'saldo': 50000,
        'saldo_cdb': 0,
        'cartao': {
            'limite_total': 120000,
            'limite_disponivel': 120000,
            'fatura': 0
        }
    }
    salvar_usuario(cpf, usuario)
    limpar_tela()
    print('Cadastro realizado com sucesso!')
    pausa()

def login():
    limpar_tela()
    print('===== LOGIN NEXUS =====')
    cpf = input('Digite seu CPF\n--> ')

    if not existe_usuario(cpf):
        limpar_tela()
        print('CPF não encontrado')
        pausa()
        return None

    limpar_tela()
    print('===== LOGIN BB =====')
    senha = input('Digite sua senha\n--> ')

    usuario = carregar_usuario(cpf)
    if usuario['senha'] == senha:
        limpar_tela()
        print('Login realizado com sucesso!')
        pausa()
        return cpf
    else:
        limpar_tela()
        print('Senha incorreta')
        pausa()
        return None

def sair():
    limpar_tela()
    input('Digite qualquer tecla para sair...')

def iniciar_sistema():
    while True:
        limpar_tela()
        print('===== BEM-VINDO AO BANCO NEXUS =====')
        print('1 - Login')
        print('2 - Cadastro')
        print('3 - Sair')
        op = input('Escolha uma opção\n--> ')

        if op == '1':
            cpf_logado = login()
            if cpf_logado:
                menu(cpf_logado)
            else:
                continue
        elif op == '2':
            cadastro()
        elif op == '3':
            sair()
            break
        else:
            print('Opção inválida, tente novamente')
            pausa()

def menu(cpf):
    while True:
        limpar_tela()
        usuario = carregar_usuario(cpf)
        print('===== MENU PRINCIPAL BANCO NEXUS =====')
        print(f'Saldo: R${usuario["saldo"]:.2f}')
        print('1 - Fazer Pix')
        print('2 - Mostrar Saldo / Investimento')
        print('3 - Cartão')
        print('4 - Voltar ao início')
        opcao_inicial = input('Escolha uma opção\n--> ')

        if opcao_inicial == '1':
            fazer_pix(cpf)
        elif opcao_inicial == '2':
            investimento(cpf)
        elif opcao_inicial == '3':
            ver_cartao(cpf)
        elif opcao_inicial == '4':
            break
        else:
            print('Opção inválida')
            pausa()

if __name__ == "__main__":
    iniciar_sistema()
