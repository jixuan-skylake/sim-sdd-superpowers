/* fixture only: minimal timer module used to exercise similar-module search */

typedef struct FooTimer {
    unsigned ctrl;
    unsigned cmp;
    unsigned status;
} FooTimer;

void foo_timer_reset(FooTimer *s) {
    s->ctrl = 0;
    s->cmp = 0;
    s->status = 0;
}

void foo_timer_write_ctrl(FooTimer *s, unsigned value) {
    s->ctrl = value;
}

unsigned foo_timer_read_status(FooTimer *s) {
    return s->status;
}
