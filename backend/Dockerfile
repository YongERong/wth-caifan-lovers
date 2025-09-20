FROM python:3.13-slim-bookworm
COPY --from=docker.io/astral/uv:latest /uv /uvx /bin/

ADD . /app
WORKDIR /app
RUN uv sync --locked
EXPOSE 8000

CMD ["uv", "run", "main.py"]

