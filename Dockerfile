FROM node:20-bookworm

# Install Python (for AI) + venv support
RUN apt-get update \
 && apt-get install -y python3 python3-venv python3-pip \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node deps (backend)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Install Python deps in venv
COPY requirements.txt .
RUN python3 -m venv /opt/venv \
 && /opt/venv/bin/python -m pip install --no-cache-dir -U pip setuptools wheel \
 && /opt/venv/bin/python -m pip install --no-cache-dir -r requirements.txt

# Let backend call venv python directly
ENV PYTHON_BIN=/opt/venv/bin/python

# Copy the rest of the project
COPY . .

EXPOSE 8080
CMD ["node","backend/src/server.js"]
