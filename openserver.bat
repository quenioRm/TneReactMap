@echo off
set /p username=Digite o nome de usuário: u171491166
set /p server=Digite o endereço IP ou nome de domínio do servidor SSH: 154.56.48.33
set /p port=Digite o número da porta SSH: 65002

ssh -p %port% %username%@%server%

pause

ssh -p 65002 u171491166@154.56.48.33
