import subprocess
import os

PORT = os.environ.get("PORT")

subprocess.run('python manage.py runserver 0.0.0.0:' + str(PORT), shell=True)