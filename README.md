# Botium Connector for for SAP Conversational AI

[![NPM](https://nodei.co/npm/botium-connector-sapcai.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/botium-connector-sapcai/)

[![Codeship Status for codeforequity-at/botium-connector-sapcai](https://app.codeship.com/projects/22e46100-911b-0137-ae8a-4e8cea91d933/status?branch=master)](https://app.codeship.com/projects/356365)
[![npm version](https://badge.fury.io/js/botium-connector-sapcai.svg)](https://badge.fury.io/js/botium-connector-sapcai)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

This is a [Botium](https://github.com/codeforequity-at/botium-core) connector for testing your SAP Conversational AI chatbot.

__Did you read the [Botium in a Nutshell](https://medium.com/@floriantreml/botium-in-a-nutshell-part-1-overview-f8d0ceaf8fb4) articles? Be warned, without prior knowledge of Botium you won't be able to properly use this library!__

## How it works
Botium connects to your SAP Conversational AI chatbot using its [Dialog endpoint](https://cai.tools.sap/docs/api-reference/?javascript#dialog-text). 

It can be used as any other Botium connector with all Botium Stack components:
* [Botium CLI](https://github.com/codeforequity-at/botium-cli/)
* [Botium Bindings](https://github.com/codeforequity-at/botium-bindings/)
* [Botium Box](https://www.botium.at)

## Features
* [x] Text conversation
* [x] Extracting media from Chatbot API response
* [x] Extracting buttons from Chatbot API response (All [rich message](https://cai.tools.sap/docs/concepts/structured-messages) containing button are supported)
* [x] Extracting NLP information (intent, entities) from API response
* [ ] Sending button clicks to Chatbot API
* [ ] Supporting conversation contexts

## Requirements
* **Node.js and NPM**
* a **SAP Conversational AI bot**
* a **project directory** on your workstation to hold test cases and Botium configuration

## Install Botium and SAP Conversational AI Connector

When using __Botium CLI__:

```
> npm install -g botium-cli
> npm install -g botium-connector-sapcai
> botium-cli init
> botium-cli run
```

When using __Botium Bindings__:

```
> npm install -g botium-bindings
> npm install -g botium-connector-sapcai
> botium-bindings init mocha
> npm install && npm run mocha
```

When using __Botium Box__:

_Already integrated into Botium Box, no setup required_

## Connecting SAP Conversational AI chatbot to Botium

Process is very simple, you need just a token for your Chatbot. To acquire it choose your chatbot, and go in the settings in the tokens section. Using request token is preferred. 

You can read about SAP Conversational AI tokens [here](https://cai.tools.sap/docs/api-reference/?shell#authentication).

Create a botium.json with this URL in your project directory: 

```
{
  "botium": {
    "Capabilities": {
      "PROJECTNAME": "<whatever>",
      "CONTAINERMODE": "sapcai",
      "SAPCAI_TOKEN": "..."
    }
  }
}
```

To check the configuration, run the emulator (Botium CLI required) to bring up a chat interface in your terminal window:

```
> botium-cli emulator
```

Botium setup is ready, you can begin to write your [BotiumScript](https://github.com/codeforequity-at/botium-core/wiki/Botium-Scripting) files.

## How to start sample

There is a small demo in [samples](./samples) with Botium Bindings. 

If you dont have installed Botium Core global, intstall it local:
```
> cd ./samples/
> npm install botium-core
```

Install the packages, and run the test:
```
> cd ./samples/
> npm install botium-core && npm install && npm test
```

## Supported Capabilities

Set the capability __CONTAINERMODE__ to __sapcai__ to activate this connector.

### SAPCAI_TOKEN
To acquire it 
- open [SAP Conversational AI Console Dashboard],(https://cai.tools.sap/) 
- choose your chatbot, 
- go in the settings in the tokens section.
 
Using request token is preferred. 

You can read about tokens [here](https://cai.tools.sap/docs/api-reference/?shell#authentication).

### SAPCAI_LANGUAGE

A valid language isocode like "en". If not provided a language detection will be performed. See [SAP Conversational AI, /Dialog endpoint](https://cai.tools.sap/docs/api-reference/?javascript#dialog-text).

