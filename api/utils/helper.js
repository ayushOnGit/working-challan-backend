const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { assemblyAiProvider } = require('../providers/assemblyAi');
const { By, until } = require('selenium-webdriver');
const APIError = require('./APIError');
const csv = require('csv-parser');
const fsasync = require('fs').promises;

// Hardcoded Assembly AI API key
const ASSEMBLY_AI_API_KEY = 'bcbe5837915e41949bd07d6e0098c230';


exports.paginate = (page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  return {
    offset,
    limit,
  };
};

exports.waitAndClickElementIfExists = async (driver, xpath, waitTime = 10000) => {
  await driver.wait(until.elementLocated(By.xpath(xpath)), waitTime);
  let element = await driver.findElement(By.xpath(xpath));

  await element.click();
}

const downloadFile = async (url, filePath, cookie) => {
  const writer = fs.createWriteStream(filePath);
  const response = await axios({
    headers: {
      "Cookie": cookie
    },
    url,
    method: 'GET',
    responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};


exports.readCaptcha = async (url, cookie) => {
  let filename = `audio${new Date().getTime()}.wav`
  const filePath = await path.resolve(__dirname, filename);
  await downloadFile(url, filePath, cookie)
  const text = (await convertAudioToText(filename))
  fs.unlinkSync(filePath);
  return text
}


const convertAudioToText = async (filename) => {

  const pathFile = path.resolve(__dirname, filename);
  const audioData = fs.readFileSync(pathFile)
  
  // Use hardcoded API key directly
  const uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload', audioData, {
    headers: {
      'authorization': ASSEMBLY_AI_API_KEY,
      'content-type': 'application/octet-stream'
    }
  });
  const uploadUrl = uploadResponse.data.upload_url

  const data = {
    audio_url: uploadUrl
  }

  const response = await axios.post('https://api.assemblyai.com/v2/transcript', data, {
    headers: {
      'authorization': ASSEMBLY_AI_API_KEY,
      'content-type': 'application/json'
    }
  });

  const transcriptId = response.data.id
  const pollingEndpoint = `https://api.assemblyai.com/v2/transcript/${transcriptId}`

  while (true) {
    const pollingResponse = await axios.get(pollingEndpoint, {
      headers: {
        'authorization': ASSEMBLY_AI_API_KEY
      }
    });
    const transcriptionResult = pollingResponse.data

    if (transcriptionResult.status === 'completed') {
      return convertTextToCaptchaV2(transcriptionResult.text)
    } else if (transcriptionResult.status === 'error') {
      throw new Error(`Transcription failed: ${transcriptionResult.error}`)
    } else {
      await new Promise((resolve) => setTimeout(resolve, 3000))
    }
  }
}

const removeNonAlphanumericAndSpaces = (str) => {
  return str.replace(/[^a-zA-Z0-9 ]/g, '');
}
const convertTextToCaptcha = (text) => {
  let result = ""
  const numberMap = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine']
  text = removeNonAlphanumericAndSpaces(text)
  let tokens = text.split(" ")
  for (let token of tokens) {
    if (token.length < 1) {
      continue
    }
    if (token.length == 1) {
      result += token.toLowerCase()
    } else {
      const number = numberMap.findIndex((element) => element == token.toLowerCase())
      if (number != -1)
        result += number
      else {
        result += isNaN(token) ? token.toLowerCase().charAt(0) : token
      }
    }

  }
  return result

}

const convertTextToCaptchaV2 = (text) => {
  console.log("text:",text)
  text = removeNonAlphanumericAndSpaces(text)
  let result = text.replace(/\s+/g, '').toLowerCase()
  console.log("captcha:",result)
  return result
}


exports.cleanHtmlString = (htmlString) => {
  // Replace all newline and tab characters with an empty string
  return htmlString.replace(/[\n\t]/g, '');
}

// Async function to parse CSV file
exports.parseCSVFile = async (filePath)=> {
  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlinkSync(filePath)
        resolve(results); // Resolve the promise with the parsed data
      })
      .on('error', (error) => {
        fs.unlinkSync(filePath)
        reject(error); // Reject the promise if there's an error
      });
  });
}


exports.overwriteLocalFile = async (data, filepath) => {
  try {
    await fsasync.writeFile(filepath, data, 'utf8');
  } catch (error) {
    console.error(`Error saving file at ${filepath}:`, error);
  }
};

exports.saveLocalFile = async (data, filepath) => {
  try {
    // Write data to the specified file
    const existingData = await fsasync.readFile(filepath, 'utf8');
    const newData = existingData+ (existingData.trim().length>0?'\n':'')+data
    await fsasync.writeFile(filepath, newData, 'utf8');
  } catch (error) {
    // Handle any errors that occur during file writing
    console.error(`Error saving file at ${filepath}:`, error);
  }
};
exports.readLocalOtp = async (filepath) => {
  try {
    // Read the content of the file
    const data = await fsasync.readFile(filepath, 'utf8');
    const otps = data.split('\n')
    if(!otps||otps.length<1){
      this.saveLocalFile('',filepath)  
      return ""
    }
    await fsasync.writeFile(filepath, otps.slice(1).join('\n'), 'utf8');
    return otps[0]
    // return data;
  } catch (error) {
    // Handle any errors that occur during file reading
    console.error(`Error reading file at ${filepath}:`, error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};