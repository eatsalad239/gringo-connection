/**
 * CAPTCHA solving integration
 * Can use 2captcha, anti-captcha, or browser automation
 */

interface CaptchaService {
  solveRecaptchaV2(siteKey: string, pageUrl: string): Promise<string>;
  solveHcaptcha(siteKey: string, pageUrl: string): Promise<string>;
}

class TwoCaptchaService implements CaptchaService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey || process.env.TWO_CAPTCHA_API_KEY || '';
  }

  async solveRecaptchaV2(siteKey: string, pageUrl: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('2Captcha API key not provided');
    }

    // Submit CAPTCHA for solving
    const submitRes = await fetch(`http://2captcha.com/in.php?key=${this.apiKey}&method=userrecaptcha&googlekey=${siteKey}&pageurl=${pageUrl}&json=1`);
    const submitData = await submitRes.json();
    
    if (submitData.status !== 1) {
      throw new Error(`Failed to submit CAPTCHA: ${submitData.request}`);
    }

    const captchaId = submitData.request;
    
    // Poll for solution
    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const resultRes = await fetch(`http://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${captchaId}&json=1`);
      const resultData = await resultRes.json();
      
      if (resultData.status === 1) {
        return resultData.request; // Token
      }
      
      if (resultData.request === 'CAPCHA_NOT_READY') {
        continue;
      }
      
      throw new Error(`CAPTCHA solving failed: ${resultData.request}`);
    }
    
    throw new Error('CAPTCHA solving timeout');
  }

  async solveHcaptcha(siteKey: string, pageUrl: string): Promise<string> {
    // Similar implementation for hCaptcha
    const submitRes = await fetch(`http://2captcha.com/in.php?key=${this.apiKey}&method=hcaptcha&sitekey=${siteKey}&pageurl=${pageUrl}&json=1`);
    const submitData = await submitRes.json();
    
    if (submitData.status !== 1) {
      throw new Error(`Failed to submit hCaptcha: ${submitData.request}`);
    }

    const captchaId = submitData.request;
    
    for (let i = 0; i < 120; i++) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const resultRes = await fetch(`http://2captcha.com/res.php?key=${this.apiKey}&action=get&id=${captchaId}&json=1`);
      const resultData = await resultRes.json();
      
      if (resultData.status === 1) {
        return resultData.request;
      }
      
      if (resultData.request === 'CAPCHA_NOT_READY') {
        continue;
      }
      
      throw new Error(`hCaptcha solving failed: ${resultData.request}`);
    }
    
    throw new Error('hCaptcha solving timeout');
  }
}

export { TwoCaptchaService, CaptchaService };

