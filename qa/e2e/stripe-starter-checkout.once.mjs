import { chromium } from 'playwright';
// Controlled QA, one preverified Stripe TEST session. No production or live card use.
const URL="https://checkout.stripe.com/c/pay/cs_test_a1i7tVp2uVwKHj7HU0hQjZzqWInr0ptLONfi5G65q3EkKrOL8SzB7i6gXS#fidnandhYHdWcXxpYCc%2FJ2FgY2RwaXEnKSdicyc%2FNSknZHVsTmB8Jz8ndW5acWB2cVowNFBPQjUxT2RKcDd2X2pfQjdKXDJiQkFpY2FqaT1EcDdEVl9ocGRSV0NzdGdcdGJha3xgSzFtVkI2cV98SXdOd3VvZ1VBc2Z9Z0JvRDBTMkZdNXJBQHdzNjU1Vm5razM3YDwnKSdjd2poVmB3c2B3Jz9xd3BgKSdnZGZuYndqcGthRmppancnPycmY2NjY2NjJyknaWR8anBxUXx1YCc%2FJ3Zsa2JpYFpscWBoJyknYGtkZ2lgVWlkZmBtamlhYHd2Jz9xd3BgeCUl";
if(!URL.startsWith('https://checkout.stripe.com/c/pay/cs_test_')) throw Error('LIVE PAYMENTS PROHIBITED');
const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1280,height:900}});
const log=[];
try {
 page.on('console', msg => {if(msg.type()==='error')log.push(msg.text().slice(0,150));});
 await page.goto(URL,{waitUntil:'domcontentloaded',timeout:90000});
 await page.waitForTimeout(3500);
 const state=async()=>({url:page.url().split('#')[0],title:await page.title(),inputs:await page.locator('input').evaluateAll(n=>n.map(e=>({name:e.name,placeholder:e.placeholder,autocomplete:e.autocomplete,type:e.type}))),frames:page.frames().map(f=>({url:f.url().split('?')[0].slice(0,100),name:f.name()}))});
 const initial=await state();console.log('STRIPE_TEST_PAGE_LOADED',JSON.stringify(initial));
 if(!page.url().startsWith('https://checkout.stripe.com/'))throw Error('Unexpected checkout host');
 // Field discovery within Stripe-controlled checkout and its secure card-element frames.
 const scopes=()=>[page,...page.frames()].filter(Boolean);
 async function fillBySelectors(selectors,value){for(const scope of scopes()){for(const selector of selectors){try{const field=scope.locator(selector).first();if(await field.count()&&await field.isVisible()){await field.fill(value,{timeout:3500});return selector;}}catch{}}}return null;}
 const email=await fillBySelectors(['input[type="email"]','input[autocomplete="email"]'],'civicascentai@gmail.com');
 const card=await fillBySelectors(['input[autocomplete="cc-number"]','input[name="cardnumber"]','input[name="cardNumber"]','input[placeholder*="1234 1234"]','input[aria-label*="Card number"]','input[placeholder*="Card number"]'],'4242424242424242');
 const expiry=await fillBySelectors(['input[autocomplete="cc-exp"]','input[name="exp-date"]','input[name="cardExpiry"]','input[placeholder*="MM / YY"]','input[placeholder*="MM/YY"]','input[aria-label*="Expiration"]'],'1230');
 const cvc=await fillBySelectors(['input[autocomplete="cc-csc"]','input[name="cvc"]','input[name="cardCvc"]','input[placeholder*="CVC"]','input[aria-label*="Security code"]'],'123');
 const name=await fillBySelectors(['input[autocomplete="cc-name"]','input[name="billingName"]','input[placeholder*="Name on card"]'],'CivicAscent QA');
 const zip=await fillBySelectors(['input[autocomplete="postal-code"]','input[name="postalCode"]','input[placeholder*="ZIP"]'],'76119');
 console.log('FIELDS_FILLED',JSON.stringify({email:!!email,card:!!card,expiry:!!expiry,cvc:!!cvc,name:!!name,zip:!!zip}));
 if(!card||!expiry||!cvc){console.log('FIELDS_NOT_FOUND',JSON.stringify(await state()));throw Error('Stripe test card fields unavailable; no payment submitted');}
 const pay=page.getByRole('button',{name:/^(pay|complete|purchase|subscribe)/i}).last();
 if(!await pay.count())throw Error('Stripe pay button unavailable; no payment submitted');
 const label=await pay.innerText().catch(()=>null);console.log('PAY_BUTTON',JSON.stringify(label));
 await pay.click({timeout:10000});
 await page.waitForURL(u=>u.toString().startsWith('https://civicascentai-launch-qftkzqc5n-civicascentai.vercel.app/checkout/success/'),{timeout:90000});
 console.log('SANDBOX_CHECKOUT_REDIRECT_SUCCESS',page.url().split('?')[0]);
}catch(e){console.log('SANDBOX_CHECKOUT_CHECK_FAILED',String(e).slice(0,900));try{await page.screenshot({path:'stripe-sandbox-failure.png',fullPage:true})}catch{} process.exitCode=1;}
finally {await browser.close();}
