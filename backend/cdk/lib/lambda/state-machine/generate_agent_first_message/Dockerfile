FROM --platform=linux/amd64 public.ecr.aws/lambda/python:3.12

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt --target "${LAMBDA_TASK_ROOT}" && \
    # Use python to clean up cache instead of find
    python -c "import shutil, pathlib; [shutil.rmtree(p) for p in pathlib.Path('${LAMBDA_TASK_ROOT}').glob('**/__pycache__')]" && \
    python -c "import os, pathlib; [os.remove(p) for p in pathlib.Path('${LAMBDA_TASK_ROOT}').glob('**/*.py[cod]')]"

COPY generate_agent_first_message.py ${LAMBDA_TASK_ROOT}

CMD [ "generate_agent_first_message.handler" ]