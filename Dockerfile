FROM node:20-bookworm

# Install Python for running the AI part
RUN apt-get update \
    && apt-get install -y python3 python3-pip python3-venv \
    &&  rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps (backend)
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev

# Install Python deps
COPY requirements.txt .
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip setuptools wheel
RUN pip install --no-cache-dir -r requirements.txt

# ให้ backend เรียก python จาก venv ได้
ENV PYTHON_BIN=python

# Copy the rest of the project
COPY . .

EXPOSE 8080

CMD ["node", "backend/src/server.js"]