1. Para adicionar as dependências, use:
    ```bash
    npm config set strict-ssl false (se necessário)
    npm install --save
    ```

2. Execute o restore do Banco de dados:
    - Abra o arquivo `script_bd.sql` no Workbench e execute.

3. Crie o arquivo `.env` com as seguintes chaves:
    ```plaintext
    DB_HOST        = ??????            
    DB_USER        = ??????            
    DB_PASSWORD    = ??????    
    DB_NAME    = ??????          
    DB_PORT        = ??????    
    APP_PORT    = ??????
    ```

