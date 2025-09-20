FROM python:3.13-slim-bookworm
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg

ADD . /app
WORKDIR /app
RUN uv sync --locked
EXPOSE 8000

CMD ["uv", "run", "main.py"]

