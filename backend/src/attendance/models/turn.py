class WorkPeriod:
    def __init__(self, start_time, end_time):
        self.start_time = start_time
        self.end_time = end_time

    def __repr__(self):
        return (
            f"WorkPeriod("
            f"start_time={self.start_time}, "
            f"end_time={self.end_time}"
            f")"
        )

class Turn:
    def __init__(
        self,
        id=None,
        code=None,
        name=None,
        periods=None,
        active=True
    ):
        self.id = id
        self.code = code
        self.name = name
        self.periods = periods or []
        self.active = active

    def __repr__(self):
        return (
            f"Turn("
            f"id={self.id}, "
            f"code='{self.code}', "
            f"name='{self.name}', "
            f"periods={self.periods}, "
            f"active={self.active}"
            f")"
        )