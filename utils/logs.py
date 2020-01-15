import logging
import coloredlogs


class logs(object):

    def __init__(self):
        self.logger = logging.getLogger("")
        coloredlogs.install(level='DEBUG',
                            fmt="%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s",
                            )

    def info(self, message):
        self.logger.info(message)

    def debug(self, message):
        self.logger.debug(message)

    def warning(self, message):
        self.logger.warning(message)

    def error(self, message):
        self.logger.error(message)