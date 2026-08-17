class Holiday:
    def __init__(self, id=None, date=None, reason=None, active=True):
        self.id = id
        self.date = date
        self.reason = reason
        self.active = active

    def __repr__(self):
        return (
            f"Holiday("
            f"id={self.id}, "
            f"date='{self.date}', "
            f"reason='{self.reason}', "
            f"active={self.active}"
            f")"
        )
