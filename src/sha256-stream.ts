// Streaming SHA-256 to verify large model files without WebCrypto's full-buffer digest.
// Memory usage is fixed (64 bytes + 64 words), independent of model size.
const K = new Uint32Array([
0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
]);
const rotr = (x: number, n: number) => (x >>> n) | (x << (32 - n));

export class Sha256Stream {
  private state = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  private block = new Uint8Array(64);
  private schedule = new Uint32Array(64);
  private filled = 0;
  private totalBytes = 0;

  private compress() {
    const w = this.schedule, bytes = this.block;
    for (let i = 0; i < 16; i++) {
      const j = i * 4;
      w[i] = ((bytes[j] << 24) | (bytes[j + 1] << 16) | (bytes[j + 2] << 8) | bytes[j + 3]) >>> 0;
    }
    for (let i = 16; i < 64; i++) {
      const x = w[i - 15], y = w[i - 2];
      const s0 = rotr(x, 7) ^ rotr(x, 18) ^ (x >>> 3);
      const s1 = rotr(y, 17) ^ rotr(y, 19) ^ (y >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = this.state[0], b = this.state[1], c = this.state[2], d = this.state[3];
    let e = this.state[4], f = this.state[5], g = this.state[6], h = this.state[7];
    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + s1 + ch + K[i] + w[i]) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (s0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    this.state[0] = (this.state[0] + a) >>> 0;
    this.state[1] = (this.state[1] + b) >>> 0;
    this.state[2] = (this.state[2] + c) >>> 0;
    this.state[3] = (this.state[3] + d) >>> 0;
    this.state[4] = (this.state[4] + e) >>> 0;
    this.state[5] = (this.state[5] + f) >>> 0;
    this.state[6] = (this.state[6] + g) >>> 0;
    this.state[7] = (this.state[7] + h) >>> 0;
  }

  update(data: Uint8Array) {
    this.totalBytes += data.byteLength;
    let offset = 0;
    while (offset < data.byteLength) {
      const n = Math.min(64 - this.filled, data.byteLength - offset);
      this.block.set(data.subarray(offset, offset + n), this.filled);
      this.filled += n;
      offset += n;
      if (this.filled === 64) { this.compress(); this.filled = 0; }
    }
  }

  hex(): string {
    const hi = Math.floor(this.totalBytes / 0x20000000) >>> 0;
    const lo = (this.totalBytes * 8) >>> 0;
    this.block[this.filled++] = 0x80;
    if (this.filled > 56) {
      this.block.fill(0, this.filled);
      this.compress();
      this.filled = 0;
    }
    this.block.fill(0, this.filled, 56);
    for (let i = 0; i < 4; i++) {
      this.block[56 + i] = (hi >>> (24 - 8 * i)) & 255;
      this.block[60 + i] = (lo >>> (24 - 8 * i)) & 255;
    }
    this.compress();
    return Array.from(this.state, v => v.toString(16).padStart(8, '0')).join('');
  }
}