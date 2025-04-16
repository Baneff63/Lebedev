# Lebedev

Перед началой установки, нужно установить Linux Oracle на VirtualBox, для этого нужно:

Далее переходим к установке docker с использованием grafana, вводим следующий набор команд:

1. `sudo yum install wget`

• устанавливает утилиту wget на вашу систему
![image](https://github.com/user-attachments/assets/6852ecf0-cf7e-4e21-8bdb-6b35cae4f534)

2. `sudo wget -P /etc/yum.repos.d/ https://download.docker.com/linux/centos/docker-ce.repo`

• Скачиваем файл репозитория
![image](https://github.com/user-attachments/assets/b56e1cef-3354-4307-bd7c-6b148e27d1ab)

3. `sudo yum install docker-ce docker-ce-cli containerd.io`
• Устанавливаем docker
![image](https://github.com/user-attachments/assets/db2f24fc-c9e8-4f9e-8de3-a086e8388efa)


4. `sudo systemctl enable docker --now`

• Запускаем его и разрешаем автозапуск

5. `sudo yum install curl`
• Для этого сначала убедимся в наличие пакета curl

6. `COMVER=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)`
• Объявление переменной COMVER, полученной в результате curl запроса, хранящей в себе номер последней
версии Docker Compose
