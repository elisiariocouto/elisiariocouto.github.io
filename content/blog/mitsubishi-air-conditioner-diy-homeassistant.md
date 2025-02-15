---
title: 'Connecting my Mitsubishi Electric aircons to my smart home'
description: Or "How I bypass MELCloud with small ESP32s and ESPHome"
date: 2025-02-10
tags: ["homekit", "homeassistant", "mistubishi", "esphome", "automation"]
draft: true
---

![Home Assistant with Mitsubishi air conditioners without MELCloud](../../public/img/home-assistant-mitsubishi.png)

I recently moved to a new apartment that has a Mitubishi Electric HVAC system, commonly known as an air conditioner.

The setup is comprised of 1 outdoor unit (MXZ-3F68VF) and 3 ceiling concealed ducted indoor units (SEZ-M35DA2).
On each room that as an indoor unit, there are also PAR-40MAA wall controls.

## The "official" way

![](../../public/img/mitsubishi-mac-588if-e.jpg)

On an initial search, I discovered that Mistubishi sells a Wireless Adapter (MAC-568IF-E) that you can hook up to each indoor unit. The wireless adapter connects
to a Wi-Fi network and, to control your A/C, you use the MELCloud app.

Unfortunately, the cheapest seller I found was asking for ~70€ per piece, ~210€ since I have three units. At this price point, I immediately started searching for alternatives.

## Searching for alternatives

On my last post, I was using Homebridge to integrate non-HomeKit devices into my Apple Home ecosystem. In the meantime, I've been following Home Assistant progress and
decided to give it a shot since it could replace my Homebridge installation. I was very surprised on how quick and easy it was to set up Home Assistant in a container.

Since Home Assistant automatically discovered a lot of devices in my apartment, I started searching of a way to integrate my Air Conditioners into Home Assistant.

In the forums, I found some people talking about ESPHome and how they've connected Mitsubishi Eletric systems with a cheap ESP32 board.

## ESPHome

[ESPHome](https://esphome.io), is a project that simplifies the configuration and firmware creation for microcontrollers.
It is now included in the [Open Home Foundation](https://www.openhomefoundation.org), an organization from the creators of Home Assistant that houses
other very interesting projects like [WLED](https://kno.wled.ge) - I'm planning another post where I used WLED.

ESP32 is a very popular family of microcontrollers made by [Espressif](https://www.espressif.com), usually with Wi-Fi and Bluetooth radios, very cheap (around 10€) and with a
very reliable track history.

According to [this GitHub discussion](https://github.com/echavet/MitsubishiCN105ESPHome/discussions/83), this guy successfully
connected a [M5Stack Atom S3 Lite](https://shop.m5stack.com/products/atoms3-lite-esp32s3-dev-kit) to his heat pump so I ordered the same parts.


## Parts

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Installation

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Usage

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
