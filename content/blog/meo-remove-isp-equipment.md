---
title: 'Removing my ISP equipment'
description: Lorem ipsum
date: 2025-12-01
tags: ["meo", "isp", "openwrt", "gpon", "onu", "olt", "sfp", "fiber"]
---

https://forum.zwame.pt/threads/substituir-ont-por-mikrotik-com-sfp.1012391
https://www.luleey.com/2-5g-gpon-onu-solution/

ODI DFP-34X-2C2

https://www.luleey.com/how-to-convert-a-16-digit-gpon-sn-to-a-12-digit-gpon-sn/

A MEO usa uma ligação GPON autenticada, com ip atribuído de forma dinamica por DHCP. A autenticação rege-se pelo GPON SN, que é o serial number do vosso router (no meu caso fibergateway), a GPON PWD (também PLOAD password) é um default 20-20-20-20-20-20-20-20-20-20 (dez espaços (` `) em ascii), e clonagem do MAC Address do vosso router (não tenho bem a certeza se é necessário, mas honestamente também não é um grande obstáculo).

VLAN 12 para rede

IGMP Snooping para a meobox funcionar.

https://pierrekim.github.io/blog/2016-11-01-gpon-ftth-networks-insecurity.html

Sacar o CATV é a parte mais fácil.
O sinal CATV (1550nm) é um sinal de broadcast (difusão) sem retorno e sem autenticação.
Com um receptor FTTH/CATV colocado antes do ONT consegue-se sacar esse sinal

Trata-se de um equipamento passivo que converte o sinal ótico em sinal elétrico RF (coaxial)
Na verdade é um circuito passivo que não é mais que um oscilador ótico sintonizado na frequência 1550nm
Conseguem encontrar isso em lojas da especialidade por cerca de 10€

Eu comprei lá um e confirmo que funciona em qq operador que injecta o sinal RF na rede GPON no feixe de luz 1550nm (testado com sucesso na MEO, VDF e NOS).
Não funciona na Nowo pois a fibra da Nowo (DST) não tem o sinal 1550nm (apenas os sinais de Internet down 1490nm e Internet up 1310nm)
