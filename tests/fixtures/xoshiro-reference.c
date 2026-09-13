/* Corrected xoshiro128** transition reference, David Blackman and Sebastiano Vigna (2018).
 * https://prng.di.unimi.it/xoshiro128starstar.c
 * To the extent possible under law, the author has dedicated all copyright
 * and related and neighboring rights to this software to the public domain worldwide.
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted.
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
 * IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 * TowerSim adaptation: fixed input and output driver for independent golden vectors.
 */
#include <stdint.h>
#include <stdio.h>
static uint32_t s[4] = {1,2,3,4};
static uint32_t rotl(uint32_t x, int k) { return (x << k) | (x >> (32-k)); }
static uint32_t next(void) {
  const uint32_t result = rotl(s[1]*5,7)*9;
  const uint32_t t = s[1] << 9;
  s[2] ^= s[0]; s[3] ^= s[1]; s[1] ^= s[2]; s[0] ^= s[3]; s[2] ^= t; s[3] = rotl(s[3],11);
  return result;
}
int main(void) { for(int i=0;i<10;i++) printf("%u\n",next()); }
