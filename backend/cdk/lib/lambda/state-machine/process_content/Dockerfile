FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.12-x86_64

# Install ffmpeg in a single layer, clean up cache
RUN microdnf install -y tar xz \
    jq unzip && \
    curl -sSL https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz \
    | tar -xJ \
    && mv ffmpeg-*-amd64-static/ffmpeg /usr/local/bin/ffmpeg \
    && mv ffmpeg-*-amd64-static/ffprobe /usr/local/bin/ffprobe \
    && rm -rf ffmpeg-*-amd64-static \
    && chmod +x /usr/local/bin/ffmpeg /usr/local/bin/ffprobe \
    && chmod 1777 /tmp \
    && microdnf clean all && \
    rm -rf /var/cache/yum/* /tmp/* /var/tmp/*

# Install Python dependencies
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt --target "${LAMBDA_TASK_ROOT}" && \
    # Use python to clean up cache instead of find
    python -c "import shutil, pathlib; [shutil.rmtree(p) for p in pathlib.Path('${LAMBDA_TASK_ROOT}').glob('**/__pycache__')]"

COPY process_content.py ${LAMBDA_TASK_ROOT}

CMD [ "process_content.handler" ]