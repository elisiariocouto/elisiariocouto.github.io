---
title: 'Automating my apartment: Part 1'
description: I wanted to automate a light bulb. Ended up reading RFC 6762.
date: 2023-05-01
tags: ["homekit", "matter", "shelly", "homebridge", "automation"]
---

{% image "https://images.unsplash.com/photo-1634045924031-98026a4557c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzMDAzMzh8MHwxfHNlYXJjaHwzMnx8dGVsZXZpc2lvbnxlbnwwfHx8fDE2ODI2MjI5MDg&ixlib=rb-4.0.3&q=80&w=1080", "Not my apartment. Photo by Влад Хмара on Unsplash" %}

This is the first part of a series of posts on how I automated parts of my daily routine in my apartment. First steps into the Smart Home world, HomeKit, Thread, Matter, mDNS, and some rabbit holes. Subscribe to be notified of the rest of the story.

* * *

This journey started on a usual night at my apartment. I was watching some random Netflix series on my TV, lying on the couch when bedtime came, triggering this nightly routine:

  1. Turn off the TV

  2. Turn off the floor shade next to it

  3. Walk to the bedroom, turning off the main living room light

  4. Turn on the bedroom light

  5. Go around the bed to turn on the nightstand lamps

  6. Close the shades

  7. Go back to the bedroom entrance to turn off the bedroom light

  8. *hygiene time*

  9. Turn off the nightstand lamps

  10. Sleep




Since I spend most of my time thinking about how to automate boring and repetitive tasks, this ritual was a perfect candidate for automation.

> Saying “Goodnight” to the Living Room smart speaker should do all of this — stopping at the hygiene step

Alright, let’s do this.

### First things first

This automation must follow a simple rule: I don’t want to lose the ability to turn on and off lights with my current analog switches. After some searching, I found Shelly, a Bulgarian company that sells Wi-Fi switches that you can retrofit into any common analog switch.

![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fcec0202b-e26f-47c7-b1fc-f58760b4dc9d_861x240.png)

I bought two cheap Shelly 1, their entry-level device. After some DIY electrician work (double-checking that the circuit breaker was off), I installed the first Shelly behind the main living room light switch. With the circuit breaker up, I installed the Shelly app on my iPhone, configured Shelly to connect to my home Wi-Fi network, and, _ta-da_ 🎉, I can turn on and off my living room light with a click of a button on the app.

I was very pleased with the build quality and reliability of the Shelly devices. At the time, if someone asked me for recommendations, Shelly would be a no-brainer.

{% imagegrid %}
{% image "https://substackcdn.com/image/fetch/w_720,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F31955a05-b5f2-4bb3-825c-c4c58fd966d4_1179x2556.png", "Shelly App", 300 %}

{% image "https://substackcdn.com/image/fetch/w_720,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F8e5e52e2-28a9-4052-93de-e4af0eb97140_1179x2556.png", "Room Screen", 300 %}

{% endimagegrid %}

### Connecting to HomeKit

As my phone and computer are Apple devices, it felt natural to expand this integration to Apple’s smart home ecosystem — HomeKit. However, Shelly does not have support for HomeKit. After some research, I found a [custom firmware that adds support for HomeKit](https://github.com/mongoose-os-apps/shelly-homekit) but you lose the Shelly Cloud connection feature. As this was not a big deal at the time, I flashed the custom firmware following the easy instructions on the GitHub repo. Another _ta-da_ 🎉, it worked perfectly.

This was my first step into HomeKit.

I immediately liked Apple’s Home app interface better than the Shelly app — I like apps that follow the OS design principles or have a strong design language, none of the previous applies to Shelly.

Although the custom firmware was working, there were a couple of things that were boring me:

  1. I couldn’t control the Shelly device when I wasn’t connected to my home network

  2. Bugfixes or new features in Shelly’s official firmware need to be implemented in the open-source contributors of the custom firmware, which can take some time or not happen at all




Fortunately, I found [HomeBridge](https://homebridge.io), a project that advertises itself as a smart home hub to HomeKit, with [lots of plugins](https://www.npmjs.com/search?q=keywords:homebridge-plugin) to connect non-HomeKit devices to Apple’s ecosystem. It is lightweight, thus it can be installed in a Raspberry Pi or some old Linux box you have.

I reverted the Shelly firmware to the official one, picked up an old Intel NUC I had building up dust, installed HomeBridge and the [homebridge-shelly](https://github.com/alexryd/homebridge-shelly) plugin, and, you guessed it, _ta-da_ 🎉!

{% image "https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Ff13bd637-d2bd-4832-b204-36c6f14f90d3_1490x780.png", "I’m impatient." %}

### Automation and Scenes

At this point, I set up the second Shelly on the floor shade next to the TV. When I turn on the main living room light, I also like to turn on the floor shade. With Apple Home’s _Automation_ feature, I could turn on/off both lights simultaneously:


{% image "https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F7fe29203-1972-4435-a2f4-655666a46ed2_1179x2556.png", "Nice extra feature, this automation only triggers after the sun sets down", 300 %}

Additionally, I created a _Scene_ in Apple Home that turns off the main living room light, the floor shade, and the TV (an LG which had HomeKit integration out of the box).

I must say that picking up my iPhone and saying “Hey Siri, goodnight” and looking at everything turning off instantly while walking to my bedroom feels good.

In the next part, I discovered Matter and started building a Thread network.
