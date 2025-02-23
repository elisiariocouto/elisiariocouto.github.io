---
title: 'Connecting my Mitsubishi Electric aircons to my smart home'
description: Or "How I bypass MELCloud with small ESP32s and ESPHome"
date: 2025-02-10
tags: ["homekit", "homeassistant", "mitsubishi", "esphome", "automation"]
---

{% image "../../public/img/home-assistant-mitsubishi.png", "Home Assistant with Mitsubishi air conditioners without MELCloud" %}

I recently moved to a new apartment that has a Mitsubishi Electric HVAC system, commonly known as an air conditioner.

The setup consists of 1 outdoor unit (MXZ-3F68VF) and 3 ceiling concealed ducted indoor units (SEZ-M35DA2).
On each room that as an indoor unit, there are also PAR-40MAA wall controls.

## The "official" way

{% image "../../public/img/mitsubishi-mac-588if-e.jpeg", "Mitsubishi MAC-568IF-E" %}

On an initial search, I discovered that Mitsubishi sells a Wireless Adapter (MAC-568IF-E) that
you can hook up to each indoor unit. The wireless adapter connects to a Wi-Fi network and, to
control your A/C, you use the MELCloud app.

Unfortunately, the cheapest seller I found was asking for approximately €70 per piece, €210 since I have three units.
At this price point, I immediately started searching for alternatives.

## Searching for alternatives

On my last post, I was using Homebridge to integrate non-HomeKit devices into my Apple Home ecosystem. In the meantime, I've been following Home Assistant progress and
decided to give it a shot since it could replace my Homebridge installation. I was very surprised on how quick and easy it was to set up Home Assistant in a container.

Since Home Assistant automatically discovered a lot of devices in my apartment, I started searching for a way to integrate my Air Conditioners into Home Assistant.

In the forums, I found some people talking about ESPHome and how they've connected Mitsubishi Electric systems with a cheap ESP32 board.

## ESPHome

[ESPHome](https://esphome.io), is a project that simplifies the configuration and firmware creation for microcontrollers.
It is now included in the [Open Home Foundation](https://www.openhomefoundation.org), an organization from the creators of Home Assistant that houses
other very interesting projects like [WLED](https://kno.wled.ge) - I'm planning another post where I used WLED to control a LED light strip.

ESP32 is a very popular family of microcontrollers made by [Espressif](https://www.espressif.com), usually with Wi-Fi and Bluetooth radios, very cheap (around €10) and with a
very reliable track history.

According to [this GitHub discussion](https://github.com/echavet/MitsubishiCN105ESPHome/discussions/83), this guy successfully
connected a [M5Stack Atom S3 Lite](https://shop.m5stack.com/products/atoms3-lite-esp32s3-dev-kit) to his heat pump board, so I ordered the same parts.

{% image "../../public/img/m5stack-s3-lite.jpeg", "M5Stack AtomS3 Lite compared to a dollar coin" %}

## Parts

This is the list of parts I ordered and links to [mauser.pt](https://mauser.pt), a Portuguese electronics shop:

 - [M5Stack AtomS3 Lite](https://mauser.pt/catalog/product_info.php?products_id=095-1461): small ESP32 device, nicely packaged with a couple of buttons and LEDs
 - [Grove Cables](https://mauser.pt/catalog/product_info.php?products_id=096-6569): to connect the AtomS3 to the air-con board
 - [PAP-05V-S Connectors](https://mauser.pt/catalog/product_info.php?products_id=011-3514): female connector to CN105, the connector on the air-con, used
to replace one end of the Grove cable

## Installation

First, I created the configuration file for ESPHome with the help of the information on the [GitHub discussion](https://github.com/echavet/MitsubishiCN105ESPHome/discussions/83),
you can find my configuration files in this repository: [elisiariocouto/mitsubishi-aircon-homeassistant](https://github.com/elisiariocouto/mitsubishi-aircon-homeassistant).

Feel free to use the repository as a baseline for your installation.

After putting my configuration file in a new folder, I installed ESPHome via `brew install esphome` on my laptop, connected my Atom device to my laptop using a USB-C to USB-C cable
and ran:

```console
esphome upload ac-livingroom.yaml
```

After that, I discovered the Atom in my Wi-Fi network, connected to its IP and was presented with ESPHome's web interface.

{% image "../../public/img/esphome-web-interface.png", "ESPHome Web Interface" %}

Now that I know the device boots and connects to my Wi-Fi network, it's time to connect it to the air conditioner board.

First I needed to change one of the ends of the grove cable to the correct connector.

With a small pair of tweezers, I pulled the Grove connector tabs that make the crimped part stuck on the connector in order to
remove the crimped cable from the connector. I did this to all the four wires and inserted them in the 5-pin connector as shown in the image.

{%
    image
    "../../public/img/grove-connector.jpeg",
    "Some wires detached from connector"
%}

In the GitHub discussion there were instructions on the pinout of the CN105 connector and the JST female connector should be connected as you see in the image shared there. You can guide yourself using the small triangle in the connector. That pin should not have any wire connected.

{% image "../../public/img/jst-connector.png", "CN105, small triangle points to pin 1: unused - pin 2: black (GND) - pin 3: red (5V) - pin 4: white (TX GPIO2) - pin 5: yellow (RX GPIO1)" %}

{% image "../../public/img/m5stack-cn105.jpeg", "Here is the end result, what a beauty!" %}

Done with the connections, it was time to turn off the breaker for the air conditioners, access the air-con indoor unit, remove the metal plate covering the board and connecting
the home-made device to the CN105 connector. The hardest part was discovering the actual connector in the board, but with the help of my mobile phone's flashlight I was able to locate it. **By the way, usually it's a red connector 🫡**

{% image "../../public/img/esp32-mitsubishi.jpeg", "AtomS3 Lite hooked to one indoor unit board" %}

## Usage

Using the [ESPHome integration](https://www.home-assistant.io/integrations/esphome/) in Home Assistant, I just needed to add the device and everything worked automatically.

I can even add the Air Conditioners to Apple Home via the [HomeKit Bridge](https://www.home-assistant.io/integrations/homekit) integration, which is a very reliable
integration that replaced my old Homebridge installation.

{% imagegrid %}
{% image "../../public/img/esphome-homekit.jpeg", "Device exposed to Apple Home, controlling modes and fan speed." %}
{% image "../../public/img/esphome-homekit-climate.jpeg", "For some reason, the 'Dry' mode does not appear in the menu." %}
{% endimagegrid %}
