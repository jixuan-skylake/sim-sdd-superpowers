# timer_compare

## Overview

The timer_compare module raises IRQ_COMPARE when COUNT reaches CMP and CTRL.EN is set.

## Registers

| Name | Offset | Description |
| --- | --- | --- |
| CTRL | 0x00 | Bit 0 EN enables compare. |
| CMP | 0x04 | Compare value. CMP resets to 0. |
| STATUS | 0x08 | Bit 0 MATCH is set when compare fires. Write 1 to clear. |

## Reset

CMP resets to 0. CTRL.EN resets to 0. STATUS.MATCH resets to 0.

## Interrupts

IRQ_COMPARE is asserted after STATUS.MATCH is set.
