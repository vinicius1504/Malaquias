# Guia de Deploy: Malaquias (Next.js + PostgreSQL) em VPS

## Pré-requisitos

- VPS com Ubuntu 22.04/24.04
- Acesso root via SSH
- Domínio apontando para o IP da VPS (opcional para teste)

---

## 1. Conectar na VPS e Atualizar Sistema

```bash
# Conectar via SSH
ssh root@SEU_IP_VPS

# Atualizar sistema
apt update && apt upgrade -y
```

---

## 2. Instalar Node.js (via NVM)

```bash
# Instalar NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Carregar NVM
source ~/.bashrc

# Instalar Node.js LTS
nvm install --lts

# Verificar instalação
node -v  # deve mostrar v22.x ou similar
npm -v
```

---

## 3. Instalar PostgreSQL

```bash
# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y

# Verificar se está rodando
systemctl status postgresql

# Acessar PostgreSQL
sudo -i -u postgres
psql
```

### Criar banco e usuário para o Malaquias:

```sql
-- Dentro do psql, execute:
CREATE DATABASE malaquias;
CREATE USER malaquias_user WITH ENCRYPTED PASSWORD 'SUA_SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON DATABASE malaquias TO malaquias_user;

-- Dar permissões no schema public (PostgreSQL 15+)
\c malaquias
GRANT ALL ON SCHEMA public TO malaquias_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO malaquias_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO malaquias_user;

-- Sair
\q
exit
```

### Testar conexão:

```bash
psql -h localhost -U malaquias_user -d malaquias
# Digite a senha quando solicitado
# Se conectar, está funcionando! Digite \q para sair
```

---

## 4. Instalar Git e Clonar Repositório

```bash
# Instalar Git
apt install git -y

# Criar diretório para projetos
mkdir -p /var/www
cd /var/www

# Clonar o repositório
git clone https://github.com/vinicius1504/Malaquias.git
cd Malaquias
```

---

## 5. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo de .env
cp .env.example .env

# Editar .env
nano .env
```

### Configurar o .env (substituir valores do Supabase por PostgreSQL local):

```env
# Banco de dados local (substituir Supabase)
DATABASE_URL="postgresql://malaquias_user:SUA_SENHA_FORTE_AQUI@localhost:5432/malaquias"

# Se o projeto usa variáveis específicas do Supabase, adaptar:
# NEXT_PUBLIC_SUPABASE_URL -> remover ou comentar
# NEXT_PUBLIC_SUPABASE_ANON_KEY -> remover ou comentar

# Adicionar variáveis do PostgreSQL direto se necessário:
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=malaquias
POSTGRES_USER=malaquias_user
POSTGRES_PASSWORD=SUA_SENHA_FORTE_AQUI

# Outras variáveis que o projeto precise
NODE_ENV=production
```

> Salvar: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## 6. Instalar Dependências e Buildar

```bash
# Instalar dependências
npm install

# Se houver migrations do Supabase/Prisma, rodar:
# npx prisma migrate deploy
# ou
# npx prisma db push

# Buildar para produção
npm run build
```

---

## 7. Instalar PM2 (Gerenciador de Processos)

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "malaquias" -- start

# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs malaquias

# Configurar para iniciar no boot
pm2 startup
pm2 save
```

---

## 8. Instalar e Configurar Nginx

```bash
# Instalar Nginx
apt install nginx -y

# Criar configuração do site
nano /etc/nginx/sites-available/malaquias
```

### Configuração do Nginx:

```nginx
server {
    listen 80;
    server_name SEU_DOMINIO.com.br;  # ou use o IP da VPS para teste

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout maior para operações longas
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

```bash
# Ativar site
ln -s /etc/nginx/sites-available/malaquias /etc/nginx/sites-enabled/

# Remover site padrão (opcional)
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

---

## 9. Configurar SSL (HTTPS) - Opcional mas Recomendado

```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx -y

# Obter certificado (substitua pelo seu domínio)
certbot --nginx -d SEU_DOMINIO.com.br

# Renovação automática (já configurada por padrão)
certbot renew --dry-run
```

---

## 10. Configurar Firewall

```bash
# Permitir SSH, HTTP e HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Ativar firewall
ufw enable

# Verificar status
ufw status
```

---

## 11. Migrar Dados do Supabase (Se Necessário)

### No Supabase (exportar):

```bash
# Via Supabase CLI ou pg_dump do seu projeto Supabase
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" > backup_supabase.sql
```

### Na VPS (importar):

```bash
# Importar para o PostgreSQL local
psql -h localhost -U malaquias_user -d malaquias < backup_supabase.sql
```

---

## Comandos Úteis

### Gerenciar Aplicação (PM2):

```bash
pm2 status              # Ver status
pm2 logs malaquias      # Ver logs
pm2 restart malaquias   # Reiniciar
pm2 stop malaquias      # Parar
pm2 delete malaquias    # Remover
```

### Atualizar Código:

```bash
cd /var/www/Malaquias
git pull origin main
npm install
npm run build
pm2 restart malaquias
```

### Gerenciar PostgreSQL:

```bash
sudo -i -u postgres psql              # Acessar como admin
psql -h localhost -U malaquias_user -d malaquias  # Acessar como user do app

# Dentro do psql:
\dt                    # Listar tabelas
\d nome_tabela         # Ver estrutura da tabela
SELECT * FROM tabela;  # Consultar dados
```

### Ver Logs:

```bash
pm2 logs malaquias           # Logs da aplicação
tail -f /var/log/nginx/error.log   # Logs do Nginx
journalctl -u postgresql     # Logs do PostgreSQL
```

---

## Troubleshooting

### Erro: "ECONNREFUSED" ao conectar no PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Verificar configuração de conexão
nano /etc/postgresql/*/main/pg_hba.conf
# Deve ter linha: local all all md5

# Reiniciar PostgreSQL
systemctl restart postgresql
```

### Erro: Aplicação não inicia

```bash
# Ver logs detalhados
pm2 logs malaquias --lines 100

# Testar manualmente
cd /var/www/Malaquias
npm run start
```

### Erro 502 Bad Gateway no Nginx

```bash
# Verificar se app está rodando na porta 3000
pm2 status
curl http://localhost:3000

# Verificar logs do Nginx
tail -f /var/log/nginx/error.log
```

---

## Checklist Final

- [ ] Sistema atualizado
- [ ] Node.js instalado (v20+)
- [ ] PostgreSQL instalado e banco criado
- [ ] Repositório clonado
- [ ] .env configurado com banco local
- [ ] Dependências instaladas
- [ ] Build executado sem erros
- [ ] PM2 rodando aplicação
- [ ] Nginx configurado e rodando
- [ ] SSL configurado (se tiver domínio)
- [ ] Firewall ativo
- [ ] Aplicação acessível via navegador
