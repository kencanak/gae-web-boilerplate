FROM nikolaik/python-nodejs:python3.11-nodejs18

WORKDIR /app

COPY . /app

# chmod the shell script, so that it is executable
RUN chmod +x /app/run.sh

# just to confirm chmod is working ok
RUN ls -l /app/run.sh

ENTRYPOINT [ "/app/run.sh" ]
