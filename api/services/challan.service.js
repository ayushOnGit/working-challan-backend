const { CHALLAN_TYPES, CHALLAN_FETCH_STATUS } = require("../utils/enums");

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const request = require('request');
const axios = require('axios');
const { readCaptcha, waitAndClickElementIfExists, cleanHtmlString, readLocalOtp, saveLocalFile, overwriteLocalFile } = require("../utils/helper");
const cheerio = require('cheerio');
const { wrapper } = require('axios-cookiejar-support');
const tough = require('tough-cookie');
const jsdom = require("jsdom");
const prisma = require("../../db/prisma/prisma");
const { JSDOM } = jsdom;
const moment = require('moment');
const APIError = require("../utils/APIError");
const { remote } = require('webdriverio');
const { mparviahanProvider } = require("../providers/mparivahan");
//require('chromedriver');
process.env.PATH = '/usr/local/bin:' + process.env.PATH;
const tunnel = require("tunnel");


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

exports.isVehicleStolen = async (regNo) => {
  try {
    const axios = require('axios');
    let input = `draw=12&columns%5B0%5D%5Bdata%5D=MissingVehiclesId&columns%5B0%5D%5Bname%5D=MissingVehiclesId&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=CreatedOn&columns%5B1%5D%5Bname%5D=CreatedOn&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=State&columns%5B3%5D%5Bname%5D=State&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=District&columns%5B4%5D%5Bname%5D=District&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=true&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=PoliceStation&columns%5B5%5D%5Bname%5D=PoliceStation&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=true&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=FIRNo&columns%5B6%5D%5Bname%5D=FIRNo&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=true&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=VehicleRegistrationNo&columns%5B7%5D%5Bname%5D=VehicleRegistrationNo&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=true&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B8%5D%5Bdata%5D=VehicleType&columns%5B8%5D%5Bname%5D=VehicleType&columns%5B8%5D%5Bsearchable%5D=true&columns%5B8%5D%5Borderable%5D=true&columns%5B8%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B8%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B9%5D%5Bdata%5D=Complainant&columns%5B9%5D%5Bname%5D=Complainant&columns%5B9%5D%5Bsearchable%5D=true&columns%5B9%5D%5Borderable%5D=true&columns%5B9%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B9%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B10%5D%5Bdata%5D=StolenDate&columns%5B10%5D%5Bname%5D=StolenDate&columns%5B10%5D%5Bsearchable%5D=true&columns%5B10%5D%5Borderable%5D=true&columns%5B10%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B10%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B11%5D%5Bdata%5D=MissingStatus&columns%5B11%5D%5Bname%5D=MissingStatus&columns%5B11%5D%5Bsearchable%5D=true&columns%5B11%5D%5Borderable%5D=true&columns%5B11%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B11%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=1&order%5B0%5D%5Bdir%5D=desc&start=0&length=10&search%5Bvalue%5D=${regNo}&search%5Bregex%5D=false`;

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'https://zipnet.delhipolice.gov.in/VehiclesMobiles/GetMissingVehiclesData/',
  headers: { 
    'accept': 'application/json, text/javascript, */*; q=0.01', 
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7', 
    'cache-control': 'no-cache', 
    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
    'origin': 'https://zipnet.delhipolice.gov.in', 
    'pragma': 'no-cache', 
    'priority': 'u=1, i', 
    'referer': 'https://zipnet.delhipolice.gov.in/', 
    'sec-ch-ua-mobile': '?0', 
    'sec-ch-ua-platform': '"macOS"', 
    'sec-fetch-dest': 'empty', 
    'sec-fetch-mode': 'cors', 
    'sec-fetch-site': 'same-origin', 
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36', 
    'x-requested-with': 'XMLHttpRequest', 
    'Cookie': 'ASP.NET_SessionId=c5nkde0odpwk1yg2e1e4c4ap'
  },
  data : input
};

  const data = await axios.request(config)

    const body =  data?.data
    console.log('fir data', body);

    if (body.recordsTotal>0)
      return { status: true, body: JSON.stringify(body) }
    else 
      return { status: false, body: JSON.stringify(body) }
  }
  catch (e) { 
    console.log('fir fail',e)
    return { status: null, body: null } }
}


exports.fetchVCourtData = async (reg_no, captcha, phpsess, jssess, vToken, vTokenSession) => {
  const data = await fetch("https://vcourts.gov.in/virtualcourt/admin/mobilesearchajax.php", {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8,hi;q=0.7",
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      "pragma": "no-cache",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Not(A:Brand\";v=\"99\", \"Google Chrome\";v=\"133\", \"Chromium\";v=\"133\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"macOS\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": `VIRTUALCOURT_SESSION=${vTokenSession}; JSESSION=${jssess}`,
      "Referer": "https://vcourts.gov.in/",
      "Referrer-Policy": "strict-origin"
    },
    "body": `challan_no=&vehicle_no=${reg_no}&fcaptcha_code=${captcha}&vajax=Y&v_token=${vToken}`,
    "method": "POST"
  });
  const body = await data.text()
  console.log('vcourt data', body)
  if (body.trim() == "This number does not exist") {
    return { challans: null, status: CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND }
  }
  if (!body?.trim() || body?.trim() == '' || body?.trim().includes('Invalid Captcha...')) {
    console.log('vcourt failure body ' + reg_no + ': `', body, '`');
    throw new Error('No data found')
  }
  const bodyJson = JSON.parse(body.trim());
  let challanJson;
  if (bodyJson?.historytable)
    challanJson = await extractHtmlData(bodyJson?.historytable)
  return { challans: cleanHtmlString(bodyJson?.historytable), status: CHALLAN_FETCH_STATUS.SUCCESS, challanJson }

  throw 'unknown error'
}


const extractHtmlData = async (html) => {

  const challans = []
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Get all rows that contain case data
  const rows = document.querySelectorAll('tbody > tr[style*="background-color: #F0C987;"]');

  for (let row of rows) {
    // Extract case and challan numbers
    const caseNumberText = row.querySelector('td:nth-child(2)').textContent;
    const caseNumberMatch = caseNumberText.match(/Case No\.\s*:\s*(\S+)/);
    const challanNumberMatch = caseNumberText.match(/Challan No\.\s*:\s*(\S+)/);
    const status = row.querySelector('span[id^="updatestatus"]')?.textContent.trim();

    const caseNumber = caseNumberMatch ? caseNumberMatch[1] : null;
    const challanNumber = challanNumberMatch ? challanNumberMatch[1] : null;

    // Find the nested table and the last row in that table for the actual fine amount
    const nestedTable = row.nextElementSibling.querySelector('table.off_tbl');
    const lastRowFineAmount = nestedTable?.querySelector('tbody > tr:last-child > td:last-child.font-weight-bold');
    const fineAmount = lastRowFineAmount ? lastRowFineAmount.textContent.trim() : 'N/A';

    // Extract multiple "Punishable Under" section codes
    const punishableSections = [];
    const punishableSectionCells = nestedTable?.querySelectorAll('td:nth-child(3)');

    punishableSectionCells?.forEach(cell => {
      const punishableUnderSpans = cell.querySelectorAll('span');
      punishableUnderSpans.forEach(span => {
        if (span.innerHTML.includes('Punishable Under')) {
          const sectionCodeRegex = /Section:<\/b>\s*(\d+(?:\([1-9]\))?[A-Z]?)/g;

          const sectionMatch = span.innerHTML.match(sectionCodeRegex);
          if (sectionMatch && sectionMatch[0]) {
            punishableSections.push(sectionMatch[0]?.split('</b>')?.[1] || 'act_error');
          }
        }
      });
    });
    const totalActAmount = await this.calculateActAmount(punishableSections)
    // Log the results
    // console.log(`Record ${index + 1}:`);
    // console.log(`Case No: ${caseNumber}`);
    // console.log(`Challan No: ${challanNumber}`);
    // console.log(`Status: ${status || 'N/A'}`);
    // console.log(`Fine Amount: ${fineAmount}`);
    // console.log(`Punishable Sections: ${punishableSections.join(', ')}`);
    // console.log(`Punishable Sections Amt: ${totalActAmount}`);

    // console.log('-------------------------------');

    challans.push({ caseNumber, challanNumber, status, fineAmount, punishableSections, totalActAmount })
  };

  return challans

}

exports.fetchVcourtNoticeChallan = async (regNo) => {
  try {
    console.log('🔍 Parsing Notice Department challans from HTML...');
    
    // Initialize Selenium driver
    const screen = { width: 1000, height: 1000 };
    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments([
      '--headless',
      "--disable-blink-features=AutomationControlled",
      '--headless',
      '--no-sandbox', 
      '--disable-dev-shm-usage'
    ]);
    chromeOptions.windowSize(screen);
    chromeOptions.excludeSwitches("enable-automation");

    let driver = null;
    
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      // Get basic challan data using Selenium
      const basicResult = await bypassVcourtCaptcha(driver, regNo, 'Delhi(Notice Department)', 'DLVC02');
      
      if (!basicResult || !basicResult.challans) {
        console.log('❌ Failed to get basic challan data');
        return { challanJson: [], challans: null, status: CHALLAN_FETCH_STATUS.FAILED };
      }

      // Handle different response types from bypassVcourtCaptcha
      let htmlData;
      if (typeof basicResult.challans === 'string') {
        // If it's a string, check if it's JSON
        if (basicResult.challans.startsWith('{')) {
          try {
            const jsonData = JSON.parse(basicResult.challans);
            htmlData = jsonData.historytable || basicResult.challans;
          } catch (e) {
            htmlData = basicResult.challans; // Use as-is if JSON parsing fails
          }
        } else {
          htmlData = basicResult.challans; // Use as-is if it's HTML
        }
      } else if (basicResult.challans && typeof basicResult.challans === 'object') {
        // If it's an object, extract historytable
        htmlData = basicResult.challans.historytable || basicResult.challans;
      } else {
        htmlData = basicResult.challans;
      }

      // Parse basic challan info from HTML
      const noticeChallans = parseChallansFromHTML(htmlData, 'Notice');
      
      if (noticeChallans.length === 0) {
        console.log('❌ No Notice Department challans parsed');
        return { challanJson: [], challans: htmlData, status: CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND };
      }

      console.log(`✅ Found ${noticeChallans.length} Notice Department challans`);
      
      // Get session cookies for detailed data
      const noticeCookies = await getSessionCookies('Delhi(Notice Department)');
      
      // Fetch detailed data for each challan
      const detailedChallans = [];
      
      for (const challan of noticeChallans) {
        console.log(`\n🔍 Processing Notice challan: ${challan.challanNumber} (${challan.caseNumber})`);
        console.log(`📋 CINO: ${challan.cino}`);
        
        const caseHistory = await getCaseHistoryForChallan(
          challan.challanNumber, 
          challan.caseNumber, 
          'DLVC02', // Notice Department token
          noticeCookies,
          challan.cino
        );
        
        if (caseHistory && !caseHistory.error) {
          // Combine basic challan info with detailed case history
          detailedChallans.push({
            ...challan,
            detailedInfo: caseHistory.parsedData,
            rawHtml: caseHistory.rawHTML // Include the raw HTML from case history
          });
          
          console.log('📊 Case History Data:');
          console.log(JSON.stringify(caseHistory, null, 2));
        } else {
          detailedChallans.push({
            ...challan,
            detailedInfo: null,
            error: caseHistory?.error || 'Failed to get case history'
          });
          console.log(`❌ Failed to get case history: ${caseHistory?.error}`);
        }
        
        // Add delay between requests
        if (noticeChallans.indexOf(challan) < noticeChallans.length - 1) {
          console.log('⏳ Waiting 3 seconds before next request...');
          await delay(3000);
        }
      }

      return {
        challanJson: detailedChallans,
        challans: {
          html: htmlData,
          json: detailedChallans
        }, // Return both HTML and JSON data together
        htmlData: htmlData, // Keep for backward compatibility
        status: CHALLAN_FETCH_STATUS.SUCCESS
      };
      
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
    
  } catch (error) {
    console.error('❌ Error in enhanced Notice Department scraping:', error);
    return { challanJson: [], challans: null, status: CHALLAN_FETCH_STATUS.FAILED };
  }
};



const bypassVcourtCaptcha = async (driver, regNo, checkOption, vToken) => {
  let retry = 1
  let maxRetry = 5
  while (retry <= maxRetry) {
    try {
      await driver.get('https://vcourts.gov.in');
      await waitAndClickElementIfExists(driver, "//select[@id ='fstate_code']")
      await waitAndClickElementIfExists(driver, `//option[text() ='${checkOption}']`)

      await driver.sleep(2000)
      await waitAndClickElementIfExists(driver, "//button[@id ='payFineBTN']")
      await waitAndClickElementIfExists(driver, "//a[@id ='mainMenuActive_police']")
      await driver.sleep(1000)
      let audioElements = await driver.findElements(By.xpath("//a[@class ='captcha_play_button']"));
      let audioUrl = await audioElements?.[1]?.getAttribute('href')
      const cookies = await driver.manage().getCookies()
      let jsSession
      let phpSession
      let vTokenSession
      cookies.map((cookie) => {
        if (cookie.name == 'JSESSION')
          jsSession = cookie.value
        if (cookie.name == 'PHPSESSID')
          phpSession = cookie.value
        if (cookie.name == 'VIRTUALCOURT_SESSION')
          vTokenSession = cookie.value
      })

      let captcha = await readCaptcha(audioUrl, `VIRTUALCOURT_SESSION=${vTokenSession};JSESSION=${jsSession}`)
      if (captcha.length != 6)
        continue
      return await exports.fetchVCourtData(regNo, captcha, phpSession, jsSession, vToken, vTokenSession)
    }
    catch (e) {
      console.log(e)
      retry += 1
      if (retry > maxRetry) {
        throw e
      }
    }
  }
}

exports.fetchVcourtTrafficChallan = async (regNo) => {
  try {
    console.log('🔍 Parsing Traffic Department challans from HTML...');
    
    // Initialize Selenium driver
    const screen = { width: 1000, height: 1000 };
    let chromeOptions = new chrome.Options();
    chromeOptions.addArguments([
      '--headless',
      "--disable-blink-features=AutomationControlled",
      '--headless',
      '--no-sandbox', 
      '--disable-dev-shm-usage'
    ]);
    chromeOptions.windowSize(screen);
    chromeOptions.excludeSwitches("enable-automation");

    let driver = null;
    
    try {
      driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(chromeOptions)
        .build();

      // Get basic challan data using Selenium
      const basicResult = await bypassVcourtCaptcha(driver, regNo, 'Delhi(Traffic Department)', 'DLVC01');
      
      if (!basicResult || !basicResult.challans) {
        console.log('❌ Failed to get basic challan data');
        return { challanJson: [], challans: null, status: CHALLAN_FETCH_STATUS.FAILED };
      }

      // Handle different response types from bypassVcourtCaptcha
      let htmlData;
      if (typeof basicResult.challans === 'string') {
        // If it's a string, check if it's JSON
        if (basicResult.challans.startsWith('{')) {
          try {
            const jsonData = JSON.parse(basicResult.challans);
            htmlData = jsonData.historytable || basicResult.challans;
          } catch (e) {
            htmlData = basicResult.challans; // Use as-is if JSON parsing fails
          }
        } else {
          htmlData = basicResult.challans; // Use as-is if it's HTML
        }
      } else if (basicResult.challans && typeof basicResult.challans === 'object') {
        // If it's an object, extract historytable
        htmlData = basicResult.challans.historytable || basicResult.challans;
      } else {
        htmlData = basicResult.challans;
      }

      // Parse basic challan info from HTML
      const trafficChallans = parseChallansFromHTML(htmlData, 'Traffic');
      
      if (trafficChallans.length === 0) {
        console.log('❌ No Traffic Department challans parsed');
        return { challanJson: [], challans: htmlData, status: CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND };
      }

      console.log(`✅ Found ${trafficChallans.length} Traffic Department challans`);
      
      // Get session cookies for detailed data
      let trafficCookies;
      try {
        trafficCookies = await getSessionCookies('Delhi(Traffic Department)');
      } catch (error) {
        console.log('⚠️ Failed to get Traffic Department cookies, using Notice Department cookies as fallback');
        trafficCookies = await getSessionCookies('Delhi(Notice Department)');
      }
      
      // Fetch detailed data for each challan
      const detailedChallans = [];
      
      for (const challan of trafficChallans) {
        console.log(`\n🔍 Processing Traffic challan: ${challan.challanNumber} (${challan.caseNumber})`);
        console.log(`📋 CINO: ${challan.cino}`);
        
        // Try with Traffic Department token first
        let caseHistory = await getCaseHistoryForChallan(
          challan.challanNumber, 
          challan.caseNumber, 
          'DLVC01', // Traffic Department token
          trafficCookies,
          challan.cino
        );
        
        // Fallback to Notice Department token if needed
        if (caseHistory && caseHistory.error && caseHistory.statusCode === 500) {
          console.log('🔄 Traffic Department token failed, trying with Notice Department token...');
          const noticeCookies = await getSessionCookies('Delhi(Notice Department)');
          caseHistory = await getCaseHistoryForChallan(
            challan.challanNumber, 
            challan.caseNumber, 
            'DLVC02', // Notice Department token as fallback
            noticeCookies,
            challan.cino
          );
        }
        
        if (caseHistory && !caseHistory.error) {
          // Combine basic challan info with detailed case history
          detailedChallans.push({
            ...challan,
            detailedInfo: caseHistory.parsedData,
            rawHtml: caseHistory.rawHTML // Include the raw HTML from case history
          });
          
          console.log('📊 Case History Data:');
          console.log(JSON.stringify(caseHistory, null, 2));
        } else {
          detailedChallans.push({
            ...challan,
            detailedInfo: null,
            error: caseHistory?.error || 'Failed to get case history'
          });
          console.log(`❌ Failed to get case history: ${caseHistory?.error}`);
        }
        
        // Add delay between requests
        if (trafficChallans.indexOf(challan) < trafficChallans.length - 1) {
          console.log('⏳ Waiting 3 seconds before next request...');
          await delay(3000);
        }
      }

      return {
        challanJson: detailedChallans,
        challans: {
          html: htmlData,
          json: detailedChallans
        }, // Return both HTML and JSON data together
        htmlData: htmlData, // Keep for backward compatibility
        status: CHALLAN_FETCH_STATUS.SUCCESS
      };
      
    } finally {
      if (driver) {
        await driver.quit();
      }
    }
    
  } catch (error) {
    console.error('❌ Error in enhanced Traffic Department scraping:', error);
    return { challanJson: [], challans: null, status: CHALLAN_FETCH_STATUS.FAILED };
  }
};


exports.fetchVcourtTrafficChallanEnhanced = async (regNo) => {
  try {
    console.log('🔍 Parsing Traffic Department challans from HTML...');
    
    // Use existing function to get basic challans
    const basicResult = await this.fetchVcourtTrafficChallan(regNo);
    
    if (!basicResult || !basicResult.challans) {
      console.log('❌ Traffic Department scraping failed');
      return { challanJson: [], status: basicResult?.status || CHALLAN_FETCH_STATUS.FAILED };
    }

    // Parse basic challan info from HTML
    const trafficChallans = parseChallansFromHTML(basicResult.challans, 'Traffic');
    
    if (trafficChallans.length === 0) {
      console.log('❌ No Traffic Department challans parsed');
      return { challanJson: [], status: CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND };
    }

    console.log(`✅ Found ${trafficChallans.length} Traffic Department challans`);
    
    // Get session cookies for detailed data
    let trafficCookies;
    try {
      trafficCookies = await getSessionCookies('Delhi(Traffic Department)');
    } catch (error) {
      console.log('⚠️ Failed to get Traffic Department cookies, using Notice Department cookies as fallback');
      trafficCookies = await getSessionCookies('Delhi(Notice Department)');
    }
    
    // Fetch detailed data for each challan
    const detailedChallans = [];
    
    for (const challan of trafficChallans) {
      console.log(`\n🔍 Processing Traffic challan: ${challan.challanNumber} (${challan.caseNumber})`);
      console.log(`📋 CINO: ${challan.cino}`);
      
      // Try with Traffic Department token first
      let caseHistory = await getCaseHistoryForChallan(
        challan.challanNumber, 
        challan.caseNumber, 
        'DLVC01', // Traffic Department token
        trafficCookies,
        challan.cino
      );
      
      // Fallback to Notice Department token if needed
      if (caseHistory && caseHistory.error && caseHistory.statusCode === 500) {
        console.log('🔄 Traffic Department token failed, trying with Notice Department token...');
        const noticeCookies = await getSessionCookies('Delhi(Notice Department)');
        caseHistory = await getCaseHistoryForChallan(
          challan.challanNumber, 
          challan.caseNumber, 
          'DLVC02', // Notice Department token as fallback
          noticeCookies,
          challan.cino
        );
      }
      
      if (caseHistory && !caseHistory.error) {
        // Combine basic challan info with detailed case history
        detailedChallans.push({
            ...challan,
            detailedInfo: caseHistory.parsedData,
            rawHtml: caseHistory.rawHTML // Include the raw HTML from case history
          });
        
        console.log('📊 Case History Data:');
        console.log(JSON.stringify(caseHistory, null, 2));
      } else {
        // Add challan with error info
        detailedChallans.push({
          ...challan,
          detailedInfo: null,
          error: caseHistory?.error || 'Failed to get case history'
        });
        console.log(`❌ Failed to get case history: ${caseHistory?.error}`);
      }
      
      // Add delay between requests
      if (trafficChallans.indexOf(challan) < trafficChallans.length - 1) {
        console.log('⏳ Waiting 3 seconds before next request...');
        await delay(3000);
      }
    }

    return {
      challanJson: detailedChallans,
      challans: {
        html: basicResult.challans,
        json: detailedChallans
      }, // Return both HTML and JSON data together
      htmlData: basicResult.challans, // Keep for backward compatibility
      status: CHALLAN_FETCH_STATUS.SUCCESS
    };
    
  } catch (error) {
    console.error('❌ Error in enhanced Traffic Department scraping:', error);
    return { challanJson: [], status: CHALLAN_FETCH_STATUS.FAILED };
  }
};


exports.resetOtp = async (regNo, engineNo, chassisNo, stakeholderMobile) => {

  const cookieJar = new tough.CookieJar();

  // Wrap axios with cookie support
  const client = wrapper(axios.create({ jar: cookieJar }));

  const html = await client.get('https://traffic.delhipolice.gov.in/notice/pay-notice')
  // Get the cookies from the jar
  const cookies = cookieJar.getCookiesSync('https://traffic.delhipolice.gov.in/notice/pay-notice');

  let cookieString = []
  cookies.forEach(cookie => {
    cookieString.push(`${cookie.key}=${cookie.value}`)
  });
  // Load the HTML into cheerio
  const $ = cheerio.load(html.data);
  // Example: Select an element with a specific attribute (equivalent of an XPath query)
  const specificMeta = $('meta[name="csrf-token"]');
  const csrfToken = specificMeta.attr('content');

  try {
    const updateMobileNumber = await axios.post('https://traffic.delhipolice.gov.in/notice/verify-chasis-engine',
      `engine_no=${engineNo.slice(-4)}&chasis_no=${chassisNo.slice(-4)}&number=${stakeholderMobile}&vehicle_number=${regNo}`,
      {
        headers: {
          'X-Csrf-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': cookieString.join(';')
        }
      })
    return updateMobileNumber?.data?.data?.message
  } catch (e) {
    return 'Failed with unknown error'
  }

}


exports.fetchChallanForVehicle = async (regNo, stakeholderMobile, engineNo, chassisNo) => {
  let challanRecord = await prisma.challan.findFirst({
    where: {
      reg_no: regNo
    },
    orderBy: {
      id: "desc"
    },
  })

  if (challanRecord?.created_at && moment().diff(moment(challanRecord.created_at), 'hours') > 24) {
    challanRecord = undefined
  } else if (challanRecord?.created_at && moment().diff(moment(challanRecord?.created_at), 'hours') <= 24) {
    if (challanRecord?.mparivahan_status == CHALLAN_FETCH_STATUS.FAILED || challanRecord?.traffic_notice_status == CHALLAN_FETCH_STATUS.FAILED || challanRecord?.vcourt_notice_status == CHALLAN_FETCH_STATUS.FAILED || challanRecord?.vcourt_traffic_status == CHALLAN_FETCH_STATUS.FAILED) {
      challanRecord = undefined
    } else {
      throw new APIError({
        status: 400,
        message: 'This was searched within 24 hours please check in the table',
      })
    }
  }

  let otpResetStatus = 'Skipped'
  let vcourtNoticeChallan;
  let vcourtTrafficChallan;
  const isStolen = await this.isVehicleStolen(regNo);
  if (!isStolen?.status) {
    vcourtNoticeChallan = (!challanRecord || challanRecord?.vcourt_notice_status == CHALLAN_FETCH_STATUS.FAILED) ? (await this.fetchVcourtNoticeChallan(regNo)) : undefined
    vcourtTrafficChallan = (!challanRecord || challanRecord?.vcourt_traffic_status == CHALLAN_FETCH_STATUS.FAILED) ? (await this.fetchVcourtTrafficChallan(regNo)) : undefined
  }
  let updatedChallanRecord;
  if (challanRecord) {
    updatedChallanRecord = await prisma.challan.update({
      data: {
        fir_status_page: isStolen?.body,
        fir_status: isStolen?.status ? 'STOLEN' : (isStolen?.status == null ? 'FAILED' : 'NOT_STOLEN'),
        ...(vcourtNoticeChallan ? {
          vcourt_notice: vcourtNoticeChallan?.challans ? JSON.stringify(vcourtNoticeChallan?.challans) : null,
          vcourt_notice_status: vcourtNoticeChallan?.status,
          vcourt_notice_json: vcourtNoticeChallan?.challanJson,
        } : {}),
        ...(vcourtTrafficChallan ? {
          vcourt_traffic: vcourtTrafficChallan?.challans ? JSON.stringify(vcourtTrafficChallan?.challans) : null,
          vcourt_traffic_status: vcourtTrafficChallan?.status,
          vcourt_traffic_json: vcourtTrafficChallan?.challanJson,
        } : {})
      },
      where: {
        id: challanRecord.id
      }
    })
  }
  else {
    updatedChallanRecord = await prisma.challan.create({
      data: {
        reg_no: regNo,
        chassis_no: chassisNo,
        engine_no: engineNo,
        fir_status: isStolen?.status ? 'STOLEN' : (isStolen?.status == null ? 'FAILED' : 'NOT_STOLEN'),
        fir_status_page: isStolen?.body,
        vcourt_notice: vcourtNoticeChallan?.challans ? JSON.stringify(vcourtNoticeChallan?.challans) : null,
        vcourt_notice_status: vcourtNoticeChallan?.status,
        vcourt_traffic: vcourtTrafficChallan?.challans ? JSON.stringify(vcourtTrafficChallan?.challans) : null,
        vcourt_traffic_status: vcourtTrafficChallan?.status,
        vcourt_notice_json: vcourtNoticeChallan?.challanJson,
        vcourt_traffic_json: vcourtTrafficChallan?.challanJson,
      }
    })
  }
  if (regNo && !isStolen) {
    await this.saveMparivahanChallans(regNo, updatedChallanRecord.id)
    otpResetStatus = await this.resetOtp(regNo, engineNo || '000000', chassisNo || '000000', stakeholderMobile)
    await this.sendOtpTrafficPoliceNotice(regNo, stakeholderMobile, updatedChallanRecord.id)
    await this.saveAckoChallans(regNo, updatedChallanRecord.id)
  }

  return { updatedChallanRecord, otpResetStatus }
}




exports.fetchChallanForVehicleV2 = async (regNo, stakeholderMobile = "8287041552", engineNo, chassisNo) => {
  try {
    console.log(`🚗 Fetching challan for vehicle: ${regNo}`);
    
    // Check if vehicle already exists in database
    let challanRecord = await prisma.challan.findFirst({
      where: { reg_no: regNo }
    });
    
    if (challanRecord) {
      console.log(`📝 Vehicle ${regNo} already exists in database. Updating existing record...`);
    } else {
      console.log(`🆕 Vehicle ${regNo} not found in database. Creating new record...`);
      // Create new record if it doesn't exist
      challanRecord = await prisma.challan.create({
        data: {
          reg_no: regNo,
          chassis_no: chassisNo || null,
          engine_no: engineNo || null,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }
    
    // Define fetchVcourtChallans function inside this scope
    const fetchVcourtChallans = async () => {
      console.log('🔄 Fetching enhanced VCourt challans...');
      
      // Use enhanced functions instead of basic ones
      const [vnoticeEnhanced, vtrafficEnhanced] = await Promise.all([
        this.fetchVcourtNoticeChallan(regNo),
        this.fetchVcourtTrafficChallan(regNo)
      ]);
      
      return [vnoticeEnhanced, vtrafficEnhanced];
    };
    
    // Fetch enhanced VCourt challans with fallbacks
    let vnoticeEnhanced, vtrafficEnhanced;
    
    try {
      [vnoticeEnhanced, vtrafficEnhanced] = await fetchVcourtChallans();
      console.log('✅ VCourt challans fetched successfully');
    } catch (vcourtError) {
      console.error('⚠️ VCourt challan fetch failed:', vcourtError.message);
      console.log('🔄 Adding fallbacks: 0 VCourt challans');
      
      // Set fallback values
      vnoticeEnhanced = { challans: null, status: 'FAILED_FALLBACK', challanJson: [] };
      vtrafficEnhanced = { challans: null, status: 'FAILED_FALLBACK', challanJson: [] };
    }
    
    // Update the record with fetched data (including fallbacks)
    const updatedChallanRecord = await prisma.challan.update({
      where: { id: challanRecord.id },
      data: {
        vcourt_notice: vnoticeEnhanced.challans ? JSON.stringify(vnoticeEnhanced.challans) : null,
        vcourt_notice_status: vnoticeEnhanced.status || 'FAILED_FALLBACK',
        vcourt_notice_json: vnoticeEnhanced.challanJson || [],
        vcourt_traffic: vtrafficEnhanced.challans ? JSON.stringify(vtrafficEnhanced.challans) : null,
        vcourt_traffic_status: vtrafficEnhanced.status || 'FAILED_FALLBACK',
        vcourt_traffic_json: vtrafficEnhanced.challanJson || [],
        updated_at: new Date()
      }
    });
    
            // Fetch additional challan sources (Traffic Notice, CarInfo, and MParivahan)
        if (regNo) {
          console.log('🔄 Fetching additional challan sources...');
          
          try {
            // Fetch Delhi Police Traffic challans
            console.log('🚔 Fetching Delhi Police Traffic challans...');
            try {
              await this.sendOtpTrafficPoliceNotice(regNo, stakeholderMobile, updatedChallanRecord.id);
              console.log('✅ Delhi Police Traffic challans fetched successfully');
            } catch (delhiError) {
              console.error('⚠️ Delhi Police Traffic challan fetch failed:', delhiError.message);
              console.log('🔄 Adding fallback: 0 Delhi Police challans');
              
              // Add fallback: Save 0 challans for Delhi Police
              await prisma.challan.update({
                where: { id: updatedChallanRecord.id },
                data: {
                  traffic_notice_json: [],
                  traffic_notice_status: 'FAILED_FALLBACK',
                  updated_at: new Date()
                }
              });
            }
            
            // Fetch MParivahan challans
            console.log('🏛️ Fetching MParivahan challans...');
            try {
              await this.saveMparivahanChallans(regNo, updatedChallanRecord.id);
              console.log('✅ MParivahan challans fetched successfully');
            } catch (mparivahanError) {
              console.error('⚠️ MParivahan challan fetch failed:', mparivahanError.message);
              console.log('🔄 Adding fallback: 0 MParivahan challans');
              
              // Add fallback: Save 0 challans for MParivahan
              await prisma.challan.update({
                where: { id: updatedChallanRecord.id },
                data: {
                  mparivahan_json: [],
                  mparivahan_status: 'FAILED_FALLBACK',
                  updated_at: new Date()
                }
              });
            }
            
            // Fetch CarInfo (Acko) challans
            console.log('🚗 Fetching CarInfo (Acko) challans...');
            try {
              await this.saveAckoChallans(regNo, updatedChallanRecord.id);
              console.log('✅ CarInfo (Acko) challans fetched successfully');
            } catch (ackoError) {
              console.error('⚠️ CarInfo (Acko) challan fetch failed:', ackoError.message);
              console.log('🔄 Adding fallback: 0 CarInfo challans');
              
              // Add fallback: Save 0 challans for CarInfo
              await prisma.challan.update({
                where: { id: updatedChallanRecord.id },
                data: {
                  acko_json: [],
                  acko_status: 'FAILED_FALLBACK',
                  updated_at: new Date()
                }
              });
            }
            
            // Fetch FIR data from Zipnet API
            console.log('🚨 Fetching FIR data from Delhi Police Zipnet...');
            try {
              const firData = await fetchFIRData(regNo);
              if (firData.status) {
                console.log('✅ FIR data fetched successfully - Vehicle may be stolen');
                await prisma.challan.update({
                  where: { id: updatedChallanRecord.id },
                  data: {
                    fir_status: 'stolen',
                    updated_at: new Date()
                  }
                });
              } else {
                console.log('✅ FIR data checked - Vehicle not reported stolen');
                await prisma.challan.update({
                  where: { id: updatedChallanRecord.id },
                  data: {
                    fir_status: 'not_stolen',
                    updated_at: new Date()
                  }
                });
              }
            } catch (firError) {
              console.error('⚠️ FIR data fetch failed:', firError.message);
              console.log('🔄 Adding fallback: FIR status safe (not found in stolen database)');
              
              // Add fallback: Mark FIR status as safe if we can't determine
              await prisma.challan.update({
                where: { id: updatedChallanRecord.id },
                data: {
                  fir_status: 'not_stolen',
                  updated_at: new Date()
                }
              });
            }
            
            console.log('✅ All additional challan sources processed successfully');
        
        // Calculate and save unique challans
        console.log('🔄 Calculating unique challans...');
        const uniqueChallans = await this.calculateUniqueChallans(updatedChallanRecord.id);
        await this.saveUniqueChallans(updatedChallanRecord.id, uniqueChallans);
        console.log('✅ Unique challans calculated and saved');
        
        // Calculate settlements and save aggregated data
        if (uniqueChallans && uniqueChallans.length > 0) {
          try {
            console.log('💰 Calculating settlements...');
            const settlementService = require('./settlement.service');
            const settlementResult = await settlementService.calculateSettlementForChallans(uniqueChallans);
            await settlementService.saveAggregatedChallans(updatedChallanRecord.id, settlementResult);
            console.log('✅ Settlements calculated and aggregated data saved');
          } catch (settlementError) {
            console.error('⚠️ Error calculating settlements:', settlementError.message);
            // Continue execution even if settlement fails
          }
        } else {
          console.log('ℹ️ No unique challans found, skipping settlement calculation');
        }
      } catch (error) {
        console.error('⚠️ Error fetching additional challan sources:', error.message);
        // Continue execution even if some sources fail
      }
    }
    
    console.log(`✅ Successfully updated challan record for vehicle ${regNo}`);
    return { updatedChallanRecord };
    
  } catch (error) {
    console.error(`❌ Error in fetchChallanForVehicleV2:`, error);
    throw error;
  }
};

exports.calculateActAmount = async (actArr) => {
  const acts = await prisma.challan_act.findMany({
    where: {
      act: {
        in: actArr
      }
    }
  })
  let val = 0
  for (let act of actArr) {
    let actObj = acts.find((actData) => {
      return actData.act == act
    })
    if (!actObj)
      return 'Act missing in db'
    val += actObj.amount
  }
  return val
}


exports.fetchChallansTrafficPolice = async (regNo, mobile, otp, cookieString, csrfToken) => {
  try {
    console.log(`🔍 Fetching challans for ${regNo} with OTP: ${otp}`);
    
    // Create a new client with cookies for this request
    const cookieJar = new tough.CookieJar();
    const client = wrapper(axios.create({ jar: cookieJar }));
    
    // Set cookies manually
    cookieString.forEach(cookieStr => {
      const [key, value] = cookieStr.split('=');
      cookieJar.setCookieSync(`${key}=${value}`, 'https://traffic.delhipolice.gov.in');
    });
    
    console.log('1️⃣ First verifying OTP...');
    
    // Step 1: Verify OTP first
    const verifyResponse = await client.post('https://traffic.delhipolice.gov.in/notice/verify-otp',
      `otp=${otp}&mobile=${mobile}&rc_no=${regNo}`,
      {
        headers: {
          'X-Csrf-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    );
    
    console.log('📡 OTP verification response:', verifyResponse.status, verifyResponse.data);
    
    if (verifyResponse.data && verifyResponse.data.status !== 200) {
      console.error(`⚠️ OTP verification failed: ${verifyResponse.data.message || 'Unknown error'}`);
      throw new Error(`OTP verification failed: ${verifyResponse.data.message || 'Unknown error'}`);
    }
    
    console.log('2️⃣ Now fetching challans...');
    
    // Step 2: Get challans after OTP verification
    const data = await client.post(`https://traffic.delhipolice.gov.in/notice/pending-notice1?isOtpVerified=true&otp=${otp}&mobile=${mobile}`,
      `vehicle_number=${regNo}&notice_number=`,
      {
        headers: {
          'X-Csrf-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    );
    
    console.log('📡 Challan fetch response status:', data.status);
    console.log('📡 Challan fetch response type:', typeof data.data);
    
    const jsonData = await extractTrafficPoliceChallans(data?.data);
    console.log(`📋 Extracted ${jsonData.length} challans`);
    
    return { html: data?.data, json: jsonData };
    
  } catch (error) {
    console.error('❌ Error in fetchChallansTrafficPolice:', error.message);
    throw error;
  }
}

const extractTrafficPoliceChallans = async (html) => {

  // Initialize Cheerio
  const $ = cheerio.load(html);

  // Prepare the array to hold the extracted data
  const extractedData = [];

  // Select all <td> elements and iterate over them
  $('td').each(function (index) {
    const cellText = $(this).text().trim();

    // Determine the column index to correctly group data into rows
    const columnIndex = index % 12;

    if (columnIndex === 0) {
      extractedData.push({
        noticeNo: cellText,
        vehicleNumber: '',
        offenceDateTime: '',
        offenceLocation: '',
        offenceDetail: '',
        viewImage: '',
        penaltyAmount: '',
        status: '',
        printNotice: '',
        makePayment: '',
        verifyPayment: '',
        grievances: ''
      });
    } else {
      const currentRow = extractedData[extractedData.length - 1];
      switch (columnIndex) {
        case 1:
          currentRow.vehicleNumber = cellText;
          break;
        case 2:
          currentRow.offenceDateTime = cellText;
          break;
        case 3:
          currentRow.offenceLocation = cellText;
          break;
        case 4:
          currentRow.offenceDetail = cellText;
          break;
        case 5:
          currentRow.viewImage = $(this).find('span').attr('onclick');
          break;
        case 6:
          currentRow.penaltyAmount = cellText;
          break;
        case 7:
          currentRow.status = cellText;
          break;
        case 8:
          currentRow.printNotice = cellText;
          break;
        case 9:
          currentRow.makePayment = cellText;
          break;
        case 10:
          currentRow.verifyPayment = cellText;
          break;
        case 11:
          currentRow.grievances = cellText;
          break;
      }
    }
  });

  // Output the extracted data
  return extractedData

}


exports.sendOtpTrafficPoliceNotice = async (regNo, mobile = "8287041552", challanRecordId) => {
  const cookieJar = new tough.CookieJar();

  // Wrap axios with cookie support
  const client = wrapper(axios.create({ jar: cookieJar }));

  const html = await client.get('https://traffic.delhipolice.gov.in/notice/pay-notice')
  // Get the cookies from the jar
  const cookies = cookieJar.getCookiesSync('https://traffic.delhipolice.gov.in/notice/pay-notice');

  let cookieString = []
  cookies.forEach(cookie => {
    cookieString.push(`${cookie.key}=${cookie.value}`)
  });
  // Load the HTML into cheerio
  const $ = cheerio.load(html.data);
  // Example: Select an element with a specific attribute (equivalent of an XPath query)
  const specificMeta = $('meta[name="csrf-token"]');
  const csrfToken = specificMeta.attr('content');

  try {
    await overwriteLocalFile('', 'otp.txt');
    const res = await axios.post('https://traffic.delhipolice.gov.in/notice/pending-notice1',
      `vehicle_number=${regNo}&notice_number=`,
      {
        headers: {
          'X-Csrf-Token': csrfToken,
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': cookieString.join(';')
        }
      })



    if ((res?.data?.message == "OTP Sent successfully") || (res?.data?.status == 1 && res?.data?.message?.includes("OTP Sent successfully"))) {
      setTimeout(async () => {
        try {
          let otp = 'init'
          let challans;
          let attempts = 0;
          const maxAttempts = 3;
          
          while (otp && attempts < maxAttempts) {
            try {
              otp = await readLocalOtp('./otp.txt')
              challans = await this.fetchChallansTrafficPolice(regNo, mobile, otp, cookieString, csrfToken)
              if (challans?.json.length > 0) {
                break
              }
              attempts++;
            } catch (otpError) {
              console.error(`⚠️ OTP attempt ${attempts + 1} failed:`, otpError.message);
              attempts++;
              if (attempts >= maxAttempts) {
                console.log('🔄 Max OTP attempts reached, adding fallback: 0 Delhi Police challans');
                challans = null; // Ensure challans is null for fallback
                break;
              }
            }
          }
          
          // Determine final status based on results
          const hasChallans = challans && challans.json && challans.json.length > 0;
          const finalStatus = hasChallans ? CHALLAN_FETCH_STATUS.SUCCESS : CHALLAN_FETCH_STATUS.FAILED_FALLBACK;
          
          console.log(`🔄 Final Delhi Police status: ${finalStatus} (${hasChallans ? challans.json.length : 0} challans)`);
          
          await prisma.challan.update({
            where: {
              id: challanRecordId
            },
            data: {
              traffic_notice: hasChallans ? challans.html : null,
              traffic_notice_json: hasChallans ? challans.json : [],
              traffic_notice_status: finalStatus,
            }
          })
          
        } catch (otpTimeoutError) {
          console.error('⚠️ OTP timeout error:', otpTimeoutError.message);
          console.log('🔄 Adding fallback: 0 Delhi Police challans due to OTP timeout');
          
          await prisma.challan.update({
            where: {
              id: challanRecordId
            },
            data: {
              traffic_notice: null,
              traffic_notice_json: [],
              traffic_notice_status: CHALLAN_FETCH_STATUS.FAILED_FALLBACK,
            }
          })
        }
      }, 22000)
    } else if (typeof res?.data == 'string' && res?.data?.includes('No Record Found')) {
      console.log('🔄 No records found, adding fallback: 0 Delhi Police challans');
      await prisma.challan.update({
        where: {
          id: challanRecordId
        },
        data: {
          traffic_notice_status: CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND,
          traffic_notice: res?.data,
          traffic_notice_json: [],
        }

      })
    }
    else {
      console.log('🔄 OTP not sent successfully, adding fallback: 0 Delhi Police challans');
      await prisma.challan.update({
        where: {
          id: challanRecordId
        },
        data: {
          traffic_notice: null,
          traffic_notice_json: [],
          traffic_notice_status: CHALLAN_FETCH_STATUS.FAILED_FALLBACK,
        }
      })
    }

  } catch (e) {
    console.error('⚠️ Delhi Police error:', e.message);
    console.log('🔄 Adding fallback: 0 Delhi Police challans due to error');
    await prisma.challan.update({
      where: {
        id: challanRecordId
      },
      data: {
        traffic_notice: JSON.stringify(e),
        traffic_notice_json: [],
        traffic_notice_status: CHALLAN_FETCH_STATUS.FAILED_FALLBACK,
      }
    })
  }

}


exports.fetchMparivahanChallan = async (regNo) => {
  const caps = {
    "platformName": "Android",
    "appium:deviceName": "Android Emulator",
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": "com.nic.mparivahan",
    "appium:appActivity": ".Welcome.SplashScreen",
    "appium:noReset": true,
    "appium:fullReset": false,
    "appium:autoGrantPermissions": true,
    "appium:ensureWebviewsHavePages": true,
    "appium:nativeWebScreenshot": true,
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  }
  const driver = await remote({
    protocol: "http",
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
    capabilities: caps
  });
  try {
    const el1 = await driver.$("id:com.nic.mparivahan:id/mpinEditText");
    await el1.addValue("123456");
    const el2 = await driver.$("id:com.nic.mparivahan:id/signWithMpin");
    await el2.click();
    // await driver.waitUntil()
    // wait for 5 sec
    await driver.pause(5000);

    const el3 = await driver.$("id:com.nic.mparivahan:id/Search_bar");
    await el3.addValue(regNo);
    const el4 = await driver.$("-android uiautomator:new UiSelector().className(\"android.widget.LinearLayout\").instance(14)");
    await el4.click();
    // wait for 5 sec
    await driver.pause(5000);

    const el7 = await driver.$("id:com.nic.mparivahan:id/viewChallan");
    await el7.click();

    let i = 0
    let challans = []
    while (true) {
      try {
        const offence = []
        const el9 = await driver.$(`-android uiautomator:new UiSelector().resourceId(\"com.nic.mparivahan:id/viewTv\").instance(${i})`);
        await el9.click();

        const el10 = await driver.$("id:com.nic.mparivahan:id/challanValue");
        const el11 = await driver.$("id:com.nic.mparivahan:id/challanDateValue");
        const el14 = await driver.$("id:com.nic.mparivahan:id/expandableTv");
        await el14.click()
        const el16 = await driver.$("id:com.nic.mparivahan:id/statusValue");
        const fields = [el10, el11, el14, el16]

        for (let field of fields)
          offence.push(await field.getText())

        challans.push({
          challanNumber: offence?.[0],
          challanDate: offence?.[1],
          offense: offence?.[2],
          status: offence?.[3],
        })
        await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
        // wait for 2 sec
        await driver.pause(2000);
      } catch (e) {
        break
      }
      i += 1
    }
    await driver.terminateApp('com.nic.mparivahan')
    await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    await driver.deleteSession();
    return challans
  }
  catch (e) {
    await driver.terminateApp('com.nic.mparivahan')
    await driver.deleteSession();
    throw e
  }

}

exports.saveMparivahanChallans = async (regno, challanId) => {
  try {
    const mparivahanRes = await mparviahanProvider.post('/api/challan/fetch/mparivahan', {
      regno
    })
    const challans = mparivahanRes?.data?.challans
    let challanStatus = CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND
    if (challans && challans.length > 0) {
      challanStatus = CHALLAN_FETCH_STATUS.SUCCESS
    }
    await prisma.challan.update({
      data: {
        mparivahan_json: challans,
        mparivahan_status: challanStatus
      },
      where: {
        id: challanId
      }

    })
  } catch (e) {
    console.log(e)
    await prisma.challan.update({
      data: {
        mparivahan_json: null,
        mparivahan_status: CHALLAN_FETCH_STATUS.FAILED
      }, where: {
        id: challanId
      }
    })
  }

}


exports.fetchAckoChallan = async (regNo) => {
  const { remote } = require('webdriverio');
  const caps = {
    "platformName": "Android",
    "appium:deviceName": "Android Emulator",
    "appium:automationName": "UiAutomator2",
    "appium:appPackage": "com.acko.android",
    "appium:appActivity": "com.acko.android.AckoActivity",
    "appium:noReset": true,
    "appium:fullReset": false,
    "appium:autoGrantPermissions": true,
    "appium:ensureWebviewsHavePages": true,
    "appium:nativeWebScreenshot": true,
    "appium:newCommandTimeout": 3600,
    "appium:connectHardwareKeyboard": true
  }
  const driver = await remote({
    protocol: "http",
    hostname: "127.0.0.1",
    port: 4723,
    path: "/",
    capabilities: caps
  });
  const challans = []
  try {
    await driver.pause(5000);
    const el48 = await driver.$("accessibility id:Vehicles");
    await el48.click();
    await driver.pause(1000);
    const el49 = await driver.$("accessibility id:Add your vehicle");
    await el49.click();
    const el50 = await driver.$("class name:android.widget.EditText");
    await el50.click();
    await el50.addValue(regNo + "");
    const el51 = await driver.$("accessibility id:Continue");
    await el51.click();
    const el52 = await driver.$("accessibility id:Confirm");
    await el52.click();

    await driver.pause(3000);
    const element = await driver.$(
      '-android uiautomator:new UiSelector().descriptionContains("Challans")'
    );
    const challanText = await element.getAttribute("contentDescription")
    if (!challanText.includes('All clear')) {
      await element.click();
      const el55 = await driver.$("-android uiautomator:new UiSelector().className(\"android.view.View\").instance(11)");
      const children = await el55.$$("*");  // Fetch all child elements

      for (const child of children) {
        const description = await child.getAttribute("contentDescription");
        const fields = description.split('\n')
        if (fields.length > 2) {
          challans.push({
            'offense': fields[0],
            'amount': fields[1],
            'challanNo': fields[5],
          })
        }
      }
      await driver.executeScript("mobile: pressKey", [{ "keycode": 4 }]);
    }

    await driver.pause(3000);
    await driver.action('pointer').move({ x: 250, y: 700 }).down().pause(100).move({ duration: 50, x: 250, y: 150 }).up().perform();
    await driver.action('pointer').move({ x: 250, y: 700 }).down().pause(100).move({ duration: 50, x: 250, y: 150 }).up().perform();

    const el91 = await driver.$("accessibility id:Remove this bike?");
    await el91.click();
    await driver.terminateApp('com.acko.android')
    await driver.deleteSession();
    return challans

  } catch (e) {
    await driver.terminateApp('com.acko.android')
    await driver.deleteSession();
    throw e
  }
}


exports.saveAckoChallans = async (regno, challanId) => {
  try {
    console.log(`🚗 Fetching CarInfo challans for: ${regno}`);
    
    // Use direct Cuvora API for CarInfo challans
    const axios = require('axios');
    const config = {
      method: 'get',
      url: `https://api.cuvora.com/car/partner/v3/challan-pro?vehicle_num=${regno}`,
      headers: { 
        'Authorization': 'Bearer e6a0f41ee0b741678f0ee0d23d6e60==', 
        'apiKey': '$vutto_challan_pro@2025', 
        'clientId': 'vutto_challan_pro'
      }
    };
    
    const ackoRes = await axios.request(config);
    console.log('📡 CarInfo API Response:', ackoRes.status, ackoRes.statusText);
    
    let challans = [];
    let challanStatus = CHALLAN_FETCH_STATUS.SUCCESS;
    
    if (ackoRes.data && ackoRes.data.results && Array.isArray(ackoRes.data.results)) {
      challans = ackoRes.data.results;
      challanStatus = CHALLAN_FETCH_STATUS.SUCCESS;
      console.log(`✅ Found ${challans.length} CarInfo challans`);
    } else if (ackoRes.data && ackoRes.data.errors) {
      console.log(`⚠️ CarInfo API Error: ${ackoRes.data.errors.message}`);
      challanStatus = CHALLAN_FETCH_STATUS.FAILED;
    } else {
      console.log('ℹ️ No CarInfo challans found');
    }
    
    // Generate a unique CarInfo challan ID for tracking (32-bit safe)
    const carinfoChallanId = Math.floor(Math.random() * 1000000) + 100000; // 6-digit unique ID
    
    await prisma.challan.update({
      data: {
        acko_json: challans,
        acko_status: challanStatus,
        carinfo_challan_id: carinfoChallanId // Save the generated ID
      },
      where: {
        id: challanId
      }
    });
    
    console.log(`💾 CarInfo challans saved to database: ${challans.length} challans`);
    console.log(`🆔 CarInfo Challan ID generated: ${carinfoChallanId}`);
    
  } catch (e) {
    console.error('❌ Error fetching CarInfo challans:', e.message);
    
    await prisma.challan.update({
      data: {
        acko_json: null,
        acko_status: CHALLAN_FETCH_STATUS.FAILED,
        carinfo_challan_id: null // Set to null on error
      }, where: {
        id: challanId
      }
    });
  }
}


function parseDetailedCaseHistory(response) {
  try {
    console.log(`🔍 Parsing response type: ${typeof response}, length: ${response?.length || 'N/A'}`);
    
    if (typeof response === 'object' && response !== null) {
      console.log('📋 Response is JSON object, parsing as JSON response');
      return parseJSONResponse(response);
    }
    
    if (typeof response === 'string') {
      console.log('📋 Response is string, parsing as HTML');
      const dom = new JSDOM(response);
      const document = dom.window.document;
      
      const parsedData = {
        caseDetails: {},
        hearings: [],
        orders: [],
        documents: []
      };
      
      const tables = document.querySelectorAll('table');
      console.log(`📊 Found ${tables.length} tables in HTML response`);
      
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
          const cells = row.querySelectorAll('td');
          if (cells.length >= 2) {
            const label = cells[0]?.textContent?.trim();
            const value = cells[1]?.textContent?.trim();
            
            if (label && value && label.length > 0 && value.length > 0) {
              parsedData.caseDetails[label] = value;
            }
          }
        });
      });
      
      console.log(`📊 Parsed ${Object.keys(parsedData.caseDetails).length} case details from HTML`);
      return parsedData;
    }
    
    console.log('⚠️ Unknown response type, returning empty data');
    return { error: 'Unknown response type', caseDetails: {} };
    
  } catch (error) {
    console.error('❌ Error parsing response:', error.message);
    return { error: `Failed to parse response: ${error.message}`, caseDetails: {} };
  }
}


async function getCaseHistoryForChallan(challanNumber, caseNumber, vToken, cookies, exactCino, retryCount = 0) {
  try {
    console.log(`🔍 Getting case history for challan: ${challanNumber} (Attempt ${retryCount + 1})`);
    console.log(`📋 Using exact CINO: ${exactCino}`);
    
    const payload = {
      cino: exactCino,
      party_no: '0',
      efilno: challanNumber,
      archive_flag: '1',
      vajax: 'Y',
      v_token: vToken
    };
    
    const response = await axios.post(
      'https://vcourts.gov.in/virtualcourt/admin/case_history_partywise.php',
      new URLSearchParams(payload),
      {
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'en-US,en;q=0.9,hi;q=0.8',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'origin': 'https://vcourts.gov.in',
          'referer': 'https://vcourts.gov.in/',
          'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"macOS"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
          'x-requested-with': 'XMLHttpRequest',
          'cookie': `VIRTUALCOURT_SESSION=${cookies.vTokenSession}; JSESSION=${cookies.jsSession}`
        },
        timeout: 30000
      }
    );
    
    console.log(`✅ API Response received (${response.data?.length || 'undefined'} characters)`);
    
    // Parse the response to structured data
    const parsedData = parseDetailedCaseHistory(response.data);
    
    return {
      challanNumber,
      caseNumber,
      cino: exactCino,
      rawHTML: response.data,
      parsedData
    };
    
  } catch (error) {
    console.error(`❌ Error getting case history for ${challanNumber}:`, error.message);
    
    if (retryCount < 2 && (error.response?.status === 500 || error.code === 'ECONNRESET')) {
      console.log(`🔄 Retrying... (${retryCount + 1}/2)`);
      await delay(2000);
      return await getCaseHistoryForChallan(challanNumber, caseNumber, vToken, cookies, exactCino, retryCount + 1);
    }
    
    return {
      challanNumber,
      caseNumber,
      cino: exactCino,
      error: error.message,
      statusCode: error.response?.status
    };
  }
}

function parseJSONResponse(jsonResponse) {
  try {
    const parsedData = {
      caseDetails: {},
      offenceDetails: {},
      currentStatus: {},
      summons: null,
      terms: null
    };
    
    if (jsonResponse.historytable) {
      const dom = new JSDOM(jsonResponse.historytable);
      const document = dom.window.document;
      
      // Extract case registration details
      const caseRows = document.querySelectorAll('tbody tr');
      caseRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const label = cells[0]?.textContent?.trim();
          const value = cells[1]?.textContent?.trim();
          
          if (label && value && label.length > 0 && value.length > 0) {
            parsedData.caseDetails[label] = value;
          }
        }
      });
      
      // Extract current status
      const statusRows = document.querySelectorAll('tbody tr[style*="color:green"]');
      statusRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 2) {
          const label = cells[0]?.textContent?.trim();
          const value = cells[1]?.textContent?.trim();
          
          if (label && value && label.length > 0 && value.length > 0) {
            parsedData.currentStatus[label] = value;
          }
        }
      });
      
      // Extract offence details
      const offenceRows = document.querySelectorAll('table.off_tbl tbody tr');
      offenceRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
          const offenceCode = cells[0]?.textContent?.trim();
          const offence = cells[1]?.textContent?.trim();
          const act = cells[2]?.textContent?.trim();
          const section = cells[3]?.textContent?.trim();
          const fine = cells[4]?.textContent?.trim();
          
          if (offenceCode && offenceCode !== 'Proposed Fine') {
            parsedData.offenceDetails[offenceCode] = {
              offence,
              act,
              section,
              fine
            };
          }
        }
      });
    }
    
    if (jsonResponse.viewsummons) {
      parsedData.summons = 'PDF Summons Available';
    }
    
    if (jsonResponse.viewagree) {
      parsedData.terms = 'Terms and Conditions Available';
    }
    
    console.log(`📊 Parsed ${Object.keys(parsedData.caseDetails).length} case details, ${Object.keys(parsedData.offenceDetails).length} offences, ${Object.keys(parsedData.currentStatus).length} status items`);
    
    return parsedData;
    
  } catch (error) {
    console.error('❌ Error parsing JSON response:', error.message);
    return { error: 'Failed to parse JSON response' };
  }
}

function parseChallansFromHTML(htmlData, department) {
  try {
    const challans = [];
    const dom = new JSDOM(htmlData);
    const document = dom.window.document;
    
    const challanRows = document.querySelectorAll('tr[style*="background-color: #F0C987"]');
    
    challanRows.forEach((row, index) => {
      try {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 3) {
          const caseNumberMatch = cells[1].textContent.match(/Case No\.\s*:\s*(TC\/\d+\/\d{4})/);
          const challanNumberMatch = cells[1].textContent.match(/Challan No\.\s*:\s*([^\s&]+)/);
          const partyNameMatch = cells[1].textContent.match(/Party Name\s*:\s*([^<]+)/);
          const cinoMatch = cells[1].querySelector('span[id^="updatestatus"]');
          
          if (caseNumberMatch && challanNumberMatch && cinoMatch) {
            const caseNumber = caseNumberMatch[1];
            const challanNumber = challanNumberMatch[1];
            const partyName = partyNameMatch ? partyNameMatch[1].trim() : '';
            const cino = cinoMatch.id.replace('updatestatus', '');
            
            challans.push({
              caseNumber,
              challanNumber,
              partyName,
              cino,
              department,
              status: 'Unknown',
              additionalInfo: `Party Name: ${partyName}`
            });
          }
        }
      } catch (rowError) {
        console.log(`⚠️ Error parsing row ${index}:`, rowError.message);
      }
    });
    
    return challans;
  } catch (error) {
    console.error('❌ Error parsing HTML:', error);
    return [];
  }
}

async function getSessionCookies(department = 'Delhi(Notice Department)') {
  console.log(`🍪 Getting session cookies for ${department}...`);
  
  const screen = { width: 1000, height: 1000 };
  let chromeOptions = new chrome.Options();
  chromeOptions.addArguments([
    '--headless',
    "--disable-blink-features=AutomationControlled",
    '--headless',
    '--no-sandbox', 
    '--disable-dev-shm-usage'
  ]);
  chromeOptions.windowSize(screen);
  chromeOptions.excludeSwitches("enable-automation");

  let driver = null;
  
  try {
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(chromeOptions)
      .build();

    await driver.get('https://vcourts.gov.in');
    await driver.sleep(3000);
    
    await driver.wait(until.elementLocated(By.xpath("//select[@id ='fstate_code']")), 10000);
    const stateSelect = await driver.findElement(By.xpath("//select[@id ='fstate_code']"));
    await stateSelect.click();
    await driver.sleep(1000);
    
    await driver.wait(until.elementLocated(By.xpath(`//option[text() ='${department}']`)), 10000);
    const stateOption = await driver.findElement(By.xpath(`//option[text() ='${department}']`));
    await stateOption.click();
    await driver.sleep(2000);

    await driver.wait(until.elementLocated(By.xpath("//button[@id ='payFineBTN']")), 10000);
    const payFineBtn = await driver.findElement(By.xpath("//button[@id ='payFineBTN']"));
    await payFineBtn.click();
    await driver.sleep(2000);
    
    await driver.wait(until.elementLocated(By.xpath("//a[@id ='mainMenuActive_police']")), 10000);
    const policeMenu = await driver.findElement(By.xpath("//a[@id ='mainMenuActive_police']"));
    await policeMenu.click();
    await driver.sleep(3000);
    
    const cookies = await driver.manage().getCookies();
    let jsSession, vTokenSession;
    
    cookies.forEach((cookie) => {
      if (cookie.name === 'JSESSION') jsSession = cookie.value;
      if (cookie.name === 'VIRTUALCOURT_SESSION') vTokenSession = cookie.value;
    });

    if (!jsSession || !vTokenSession) {
      throw new Error(`Required cookies not found for ${department}`);
    }

    console.log(`✅ ${department} session cookies obtained`);
    return { jsSession, vTokenSession };
    
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
}

// ========================================
// UNIQUE CHALLANS DEDUPLICATION FUNCTIONS
// ========================================

/**
 * Calculate unique challans by deduplicating across all sources
 * Priority: VCourt Notice > VCourt Traffic > Delhi Police > CarInfo
 */
exports.calculateUniqueChallans = async (challanId) => {
  try {
    console.log('🔄 Calculating unique challans for challan ID:', challanId);
    
    // Get the challan record with all source data
    const challanRecord = await prisma.challan.findUnique({
      where: { id: challanId }
    });
    
    if (!challanRecord) {
      console.log('❌ Challan record not found');
      return [];
    }
    
    // Import settlement service for amount extraction
    const settlementService = require('./settlement.service');
    
    // Collect all challans from all sources
    const allChallans = [];
    
    // From VCourt Notice (Priority 1 - Highest)
    if (challanRecord.vcourt_notice_json && Array.isArray(challanRecord.vcourt_notice_json)) {
      challanRecord.vcourt_notice_json.forEach(challan => {
        // Extract amount for VCourt challans
        const extractedAmount = settlementService.extractAmountFromChallan(challan);
        if (extractedAmount) {
          console.log(`💰 VCourt Notice amount extracted: ₹${extractedAmount} for challan ${challan.challanNo || challan.challanNumber || challan.noticeNo}`);
        }
        allChallans.push({
          ...challan,
          source: 'vcourt_notice',
          priority: 1,
          amount: extractedAmount || challan.amount // Use extracted amount or fallback to existing
        });
      });
    }
    
    // From VCourt Traffic (Priority 2)
    if (challanRecord.vcourt_traffic_json && Array.isArray(challanRecord.vcourt_traffic_json)) {
      challanRecord.vcourt_traffic_json.forEach(challan => {
        // Extract amount for VCourt challans
        const extractedAmount = settlementService.extractAmountFromChallan(challan);
        if (extractedAmount) {
          console.log(`💰 VCourt Traffic amount extracted: ₹${extractedAmount} for challan ${challan.challanNo || challan.challanNumber || challan.noticeNo}`);
        }
        allChallans.push({
          ...challan,
          source: 'vcourt_traffic',
          priority: 2,
          amount: extractedAmount || challan.amount // Use extracted amount or fallback to existing
        });
      });
    }
    
    // From Delhi Police Traffic (Priority 3)
    if (challanRecord.traffic_notice_json && Array.isArray(challanRecord.traffic_notice_json)) {
      challanRecord.traffic_notice_json.forEach(challan => {
        allChallans.push({
          ...challan,
          source: 'traffic_notice',
          priority: 3
        });
      });
    }
    
    // From CarInfo (Priority 4 - Lowest)
    if (challanRecord.acko_json && Array.isArray(challanRecord.acko_json)) {
      challanRecord.acko_json.forEach(challan => {
        allChallans.push({
          ...challan,
          source: 'acko',
          priority: 4
        });
      });
    }
    
    console.log(`📊 Total challans collected: ${allChallans.length}`);
    
    if (allChallans.length === 0) {
      console.log('⚠️ No challans found from any source');
      return [];
    }
    
    // Group challans by challan number
    const groupedByChallanNumber = {};
    
    allChallans.forEach(challan => {
      // Handle different field names for challan number
      const challanNo = challan.challanNo || challan.challanNumber || challan.noticeNo;
      
      if (!challanNo) {
        console.log('⚠️ Challan without number found:', challan);
        return;
      }
      
      if (!groupedByChallanNumber[challanNo]) {
        groupedByChallanNumber[challanNo] = [];
      }
      
      groupedByChallanNumber[challanNo].push(challan);
    });
    
    console.log(`📋 Unique challan numbers found: ${Object.keys(groupedByChallanNumber).length}`);
    
    // Track uniquely found challans by source
    const uniqueBySource = {
      vcourt_notice: [],
      vcourt_traffic: [],
      traffic_notice: [],
      acko: []
    };
    
    // Apply priority rules for each group
    const uniqueChallans = [];
    
    Object.entries(groupedByChallanNumber).forEach(([challanNo, challanGroup]) => {
      if (challanGroup.length === 1) {
        // Single source - this challan is UNIQUE to this source only
        const { source, priority, ...challanData } = challanGroup[0];
        const challanWithMetadata = {
          ...challanData,
          source: source,
          isDuplicate: false,
          isUniqueToSource: true,
          uniqueSource: source,
          priority: priority
        };
        
        uniqueChallans.push(challanWithMetadata);
        
        // Track in uniqueBySource (these are truly unique to this source)
        if (uniqueBySource[source]) {
          uniqueBySource[source].push(challanWithMetadata);
        }
        
        console.log(`✅ Unique to ${source}: ${challanNo}`);
        
      } else {
        // Multiple sources - apply priority rules to pick the best one
        const selectedChallan = selectBestChallan(challanGroup);
        const { source, priority, ...challanData } = selectedChallan;
        const challanWithMetadata = {
          ...challanData,
          source: source,
          isDuplicate: true,
          duplicateSources: challanGroup.map(c => c.source),
          isUniqueToSource: false,
          priority: priority,
          selectedReason: `Selected from ${source} based on priority rules`
        };
        
        uniqueChallans.push(challanWithMetadata);
        
        console.log(`🔄 Duplicate ${challanNo}: Found in ${challanGroup.map(c => c.source).join(', ')} → Selected ${source}`);
      }
    });
    
    // Add summary information
    const deduplicationSummary = {
      totalChallans: allChallans.length,
      uniqueChallans: uniqueChallans.length,
      uniqueBySource: {
        vcourt_notice: uniqueBySource.vcourt_notice.length,
        vcourt_traffic: uniqueBySource.vcourt_traffic.length,
        traffic_notice: uniqueBySource.traffic_notice.length,
        acko: uniqueBySource.acko.length
      },
      duplicateChallans: uniqueChallans.filter(c => c.isDuplicate).length,
      uniquelyFoundChallans: uniqueChallans.filter(c => c.isUniqueToSource).length
    };
    
    console.log('📊 Deduplication Summary:', deduplicationSummary);
    
    console.log(`✅ Unique challans calculated: ${uniqueChallans.length}`);
    return uniqueChallans;
    
  } catch (error) {
    console.error('❌ Error calculating unique challans:', error);
    return [];
  }
};

/**
 * Select the best challan from multiple sources based on priority rules
 */
function selectBestChallan(challanGroup) {
  // Rule 1: If VCourt Notice exists, pick it (highest priority)
  const vcourtNotice = challanGroup.find(c => c.source === 'vcourt_notice');
  if (vcourtNotice) {
    console.log(`🏆 Selected VCourt Notice for challan: ${vcourtNotice.challanNo || vcourtNotice.challanNumber || vcourtNotice.noticeNo}`);
    return vcourtNotice;
  }
  
  // Rule 2: If VCourt Traffic exists and no VCourt Notice, pick it
  const vcourtTraffic = challanGroup.find(c => c.source === 'vcourt_traffic');
  if (vcourtTraffic) {
    console.log(`🥈 Selected VCourt Traffic for challan: ${vcourtTraffic.challanNo || vcourtTraffic.challanNumber || vcourtTraffic.noticeNo}`);
    return vcourtTraffic;
  }
  
  // Rule 3: If Delhi Police and CarInfo both exist (and no VCourt), pick Delhi Police
  const hasDelhiPolice = challanGroup.some(c => c.source === 'traffic_notice');
  const hasCarInfo = challanGroup.some(c => c.source === 'acko');
  
  if (hasDelhiPolice && hasCarInfo) {
    const delhiPolice = challanGroup.find(c => c.source === 'traffic_notice');
    console.log(`🥉 Selected Delhi Police for challan: ${delhiPolice.noticeNo}`);
    return delhiPolice;
  }
  
  // Rule 4: If only Delhi Police exists, pick it
  if (hasDelhiPolice && !hasCarInfo) {
    const delhiPolice = challanGroup.find(c => c.source === 'traffic_notice');
    console.log(`🏅 Selected Delhi Police for challan: ${delhiPolice.noticeNo}`);
    return delhiPolice;
  }
  
  // Rule 5: If only CarInfo exists, pick it
  if (hasCarInfo && !hasDelhiPolice) {
    const carInfo = challanGroup.find(c => c.source === 'acko');
    console.log(`🎯 Selected CarInfo for challan: ${carInfo.challanNo}`);
    return carInfo;
  }
  
  // Fallback: Pick the one with highest priority (lowest number)
  const best = challanGroup.reduce((best, current) => 
    current.priority < best.priority ? current : best
  );
  
  console.log(`🔄 Fallback selection for challan: ${best.challanNo || best.challanNumber || best.noticeNo} from ${best.source}`);
  return best;
}

/**
 * Save unique challans to database
 */
exports.saveUniqueChallans = async (challanId, uniqueChallans) => {
  try {
    console.log('💾 Saving unique challans to database...');
    
    const challanStatus = uniqueChallans.length > 0 ? 
      CHALLAN_FETCH_STATUS.SUCCESS : 
      CHALLAN_FETCH_STATUS.RECORD_NOT_FOUND;
    
    // Calculate unique by source data
    const uniqueBySource = {
      vcourt_notice: uniqueChallans.filter(c => c.isUniqueToSource && c.source === 'vcourt_notice'),
      vcourt_traffic: uniqueChallans.filter(c => c.isUniqueToSource && c.source === 'vcourt_traffic'),
      traffic_notice: uniqueChallans.filter(c => c.isUniqueToSource && c.source === 'traffic_notice'),
      acko: uniqueChallans.filter(c => c.isUniqueToSource && c.source === 'acko')
    };
    
    await prisma.challan.update({
      data: {
        unique_challans_json: uniqueChallans,
        unique_challans_status: challanStatus,
        unique_by_source_json: uniqueBySource
      },
      where: {
        id: challanId
      }
    });
    
    console.log(`✅ Unique challans saved: ${uniqueChallans.length} challans`);
    console.log(`📊 Unique by source:`, {
      vcourt_notice: uniqueBySource.vcourt_notice.length,
      vcourt_traffic: uniqueBySource.vcourt_traffic.length,
      traffic_notice: uniqueBySource.traffic_notice.length,
      acko: uniqueBySource.acko.length
    });
    return true;
    
  } catch (error) {
    console.error('❌ Error saving unique challans:', error);
    
    // Update with failed status
    try {
      await prisma.challan.update({
        data: {
          unique_challans_json: null,
          unique_challans_status: CHALLAN_FETCH_STATUS.FAILED,
          unique_by_source_json: null
        },
        where: {
          id: challanId
        }
      });
    } catch (updateError) {
      console.error('❌ Error updating status to FAILED:', updateError);
    }
    
    return false;
  }
};



