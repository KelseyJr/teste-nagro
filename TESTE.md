<h1 align="center" style="background-image: -webkit-linear-gradient( -29deg, rgb(37, 129, 196) 0%, rgb(45, 65, 127) 100%); padding: 15px;">
  <img alt="Nagro" title="Nagro" src=".github/logo.png" width="200px" />
</h1>

<p align="center"><i>Imagem feita pela <a href="https://nagro.com.br/">Nagro</a></i></p>

# Avaliação

Crie uma API para realizar um cadastro de fazendas e de produções agrícolas e pecuárias associadas a essas fazendas.

Observações:

01. Cada fazenda deve possuir nome, cidade, estado, quantidade de hectares (área total da fazenda).
02. Cada fazenda pode conter diversas produções agrícolas e pecuárias.
03. Cada produção agrícola está associada a uma ou mais fazendas, e contém quantidade de hectares plantados, ano do plantio, cultura que foi plantada.
04. Cada produção pecuária está associada a uma ou mais fazendas, e contém quantidade de animais, espécie do animal, ano da produção.
05. Cada fazenda pertence a um usuário.
06. Cada usuário deve conter email, senha, nome, cpf.
07. Cada usuário deve conseguir logar, e fazer CRUD de suas fazendas e produções.
08. No caso das produções agrícolas, a soma das área plantadas não pode ser superior a área da fazenda.

Ferramentas:

01. API: Node/Express (e demais pacotes que desejar)
02. Banco de dados: PostgreSQL
03. Demais ferramentas que desejar.
