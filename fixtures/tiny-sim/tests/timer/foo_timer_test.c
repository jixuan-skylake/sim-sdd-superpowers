/* Fixture only: shows timer reset test naming and file placement. */

#include <assert.h>

typedef struct FooTimer FooTimer;
void foo_timer_reset(FooTimer *s);

static void test_foo_timer_reset_clears_status(void) {
    /* placeholder body to exercise similar-test search */
}

int main(void) {
    test_foo_timer_reset_clears_status();
    return 0;
}
