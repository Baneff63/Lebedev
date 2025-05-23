# [![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&width=435&lines=Lebedev+linux)](https://git.io/typing-svg)

Перед началой установки, нужно установить Linux Oracle на VirtualBox

Далее переходим к установке docker с использованием grafana, вводим следующий набор команд:

1. `sudo yum install wget`

• устанавливает утилиту wget на вашу систему
![image](https://github.com/user-attachments/assets/14e01a15-477c-4904-831b-d3fc9d05df85)


2. `sudo wget -P /etc/yum.repos.d/ https://download.docker.com/linux/centos/docker-ce.repo`

• Скачиваем файл репозитория
![image](https://github.com/user-attachments/assets/793c114e-0c53-422d-aec4-4dd210670804)


3. `sudo yum install docker-ce docker-ce-cli containerd.io`

• Устанавливаем docker
![image](https://github.com/user-attachments/assets/1cc8bd5e-068c-432d-b413-85291dd4297a)


4. `sudo systemctl enable docker --now`

• Запускаем его и разрешаем автозапуск

5. `sudo yum install curl`

• Для этого сначала убедимся в наличие пакета curl

6. `COMVER=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)`

• Объявление переменной COMVER, полученной в результате curl запроса, хранящей в себе номер последней
версии Docker Compose
![image](https://github.com/user-attachments/assets/56370e09-a1f6-4829-8f13-5c17643dfa5e)


7. `sudo curl -L "https://github.com/docker/compose/releases/download/$COMVER/docker-compose-$(uname -s)-$(uname -m)" -o /usr/bin/docker-compose`                        

• Теперь скачиваем скрипт docker-compose последней версии, используя объявленную ранее переменную и помещаем его в каталог /usr/bin

![image](https://github.com/user-attachments/assets/69e2f2f0-99a9-4403-acf9-d3a72f965d0e)


8. `sudo chmod +x /usr/bin/docker-compose`

• Предоставление прав на выполнение файла docker-compose.

9. `docker-compose --version`

• Проверка установленной версии Docker Compose.

![image](https://github.com/user-attachments/assets/03295fa9-4ce1-4bda-8286-8da6dc1f557d)


• Можно скачать git прямо из командной строки прописав Y

10. `git clone https://github.com/skl256/grafana_stack_for_docker.git`

• выдаст ошибку и предложит скачать git, согласиться и продолжить
![image](https://github.com/user-attachments/assets/86f96495-463c-49d4-975e-1817683b2457)


11. `cd grafana_stack_for_docker`
    
• переход в папку

12.`sudo mkdir -p /mnt/common_volume/swarm/grafana/config`

• команда создаёт полный путь /mnt/common_volume/swarm/grafana/config, включая все необходимые промежуточные каталоги, если они ещё не существуют.

13. `sudo mkdir -p /mnt/common_volume/grafana/{grafana-config,grafana-data,prometheus-data}`

• команда создаёт структуру каталогов для Grafana и связанных с ней компонентов, если они ещё не существуют.

14. `sudo chown -R $(id -u):$(id -g) {/mnt/common_volume/swarm/grafana/config,/mnt/common_volume/grafana}`

• все файлы и каталоги в указанных директориях будут переданы в собственность текущему пользователю и его группе

15.` touch /mnt/common_volume/grafana/grafana-config/grafana.ini`

• файл grafana.ini уже существует, команда обновит его временные метки (время последнего доступа и изменения). Если файл не существует, команда создаст новый пустой файл с указанным именем по указанному пути.

16. `cp config/* /mnt/common_volume/swarm/grafana/config/`

• команда копирует все файлы и подкаталоги из директории config в директорию /mnt/common_volume/swarm/grafana/config/

17. `mv grafana.yaml docker-compose.yaml `

• команда переименовывает файл grafana.yaml в docker-compose.yaml. Ничего не покажет, но можно проверить при помощи команды ls

18.` sudo docker compose up -d`

• команда создает и запускает контейнеры в фоновом режиме, используя конфигурацию из файла docker-compose.yml, с правами суперпользователя.
![image](https://github.com/user-attachments/assets/5fb5028e-76ab-4f6f-8dd3-5dc3e4bf4bb8)


![image](https://github.com/user-attachments/assets/1bbacf31-c915-4c1d-a4b7-ac70a7708b7f)


19.` sudo vi docker-compose.yaml`

•команда открывает файл docker-compose.yaml в текстовом редакторе vi с правами суперпользователя, что позволяет вам редактировать его содержимое.

• Нас перекинет в текстовый редактор

• Что-бы что-то изменить в тесковом редакторе нажмите insert на клавиатуре

• Что бы сохранить что-то в этом документе нажимаем Esc пишем :wq! В этом текставом редакторе мы должны поставить node-exporter после services

20. `sudo vi prometheus.yaml `

• команда открывает файл prometheus.yaml в текстовом редакторе vi с правами суперпользователя.

• /mnt/common_volume/swarm/grafana/config/prometheus.yaml - исправить targets: на exporter:9100,

## Grafana

В меню выбираем вкладку Dashboards и создаём новую панель мониторинга.

После этого ожидаем появления кнопки «Добавить визуализацию» и затем нажимаем «Настроить новый источник данных».

Я  выбрал Windows, т.к Prometheus у меня не работает, но для наглядности использования подойдёт и Windows 

После этого нажимаем «Сохранить и проверить» и ожидаем появления зелёной галочки.

В меню выбираем вкладку Dashboards и создаём новую панель мониторинга.

Ждём появления кнопки «Импорт панели мониторинга».

Находим и импортируем панели мониторинга для популярных приложений на сайте grafana.com/dashboards

![image](https://github.com/user-attachments/assets/1d6bb7cf-4e2a-444f-b4f1-d727d8a6bedd)

![image](https://github.com/user-attachments/assets/dd0b7197-86ad-4624-a5d2-6d99c78e243d)


## VictoriaMetrics

Для начала нужно добавить VictoiaMetrics

Это мы можем сделать на вкладке "Plugins"
![image](https://github.com/user-attachments/assets/e04c694f-ac2c-4da1-aebf-fa13fa6721fe)

После чего заходим на главную странницу "VictoriaMetrics" 
![image](https://github.com/user-attachments/assets/b8348a58-521a-4ba7-af7b-2e93dde45396)

Заходим в Data source connections
И создаём dashboard 
![image](https://github.com/user-attachments/assets/0fc37f92-c533-4301-b8b3-95a9d75d54ff)

Создаём нужную нам панель с визуализацией 
![image](https://github.com/user-attachments/assets/7f23e115-7b99-423c-a1c1-dc10ade7e272)







