Aximmetry is a powerful production tool for compositing real-time Unreal environments with live video.
The applications for Aximmetry DE include:
- Greenscreen Production
- LED Wall/Projection Screen Production
- AR Environments

### Dual Engine (DE)

> [!INFO]
> Aximmetry has their own fork of Unreal Engine (called "*Aximmetry for Unreal*"). This is the 'Dual Engine' selling point.
> This Unreal version will work **in runtime** when you are using Aximmetry.

Inside of *Unreal for Aximmetry* fork there is some new Axim-specific **blueprints**, Axim-specific **cameras**, and a 'Axim **bake scene**' function.

*Aximmetry Composer* (the 'core' Axim software) works like a wrapper for the "*Aximmetry for Unreal*" fork. 

The Unreal version will play (in runtime) in the background, and Aximmetry Composer will see any Aximmetry cameras placed in the Unreal environment.
These Unreal cameras, along with any Unreal objects that have Aximmetry blueprinting attached to them, can be accessed from the Composer software.

### The Workflow (most basic)

1. Open *Unreal for Aximmetry* and create a project. 
2. Add an Aximmetry camera and build out the virtual environment.
3. "Axim Bake Scene".
4. Close Unreal and open up *Aximmetry Composer*.
5. Define Video Inputs (SDI cameras), and Video Outputs (monitors).
6. Drag the *Unreal for Aximmetry* .ue file into the Composer - it will appear as a node.
7. Add a virtual camera node (for the Axim Camera you created in Unreal).
8. Add a media input node (for any SDI cameras you are using).
9. Now you can control compositing and virtual camera positioning inside the Composer.

### Documentation

Aximmetry is a very large software, and while there is a lot of documentation about preparing a scene, there is less documentation about live production and troubleshooting.

[Aximmetry Knowledge Base](https://aximmetry.com/learn/welcome/)

### XR-IT Integration

**Positives:**
- Aximmetry has inbuilt systems for communication via DMX, Midi, UDP, OSC, WebSocket, HTTP...etc - input and output - with a node-based coding platform. [Aximmetry Scripting](https://aximmetry.com/learn/virtual-production-workflow/preparation-of-the-production-environment-phase-i/scripting-in-aximmetry/introduction-to-scripting-in-aximmetry/)
- Aximmetry is a professional solution for compositing and virtual production, meaning its solutions for mapping video input/outputs, keying, masking, camera triggers, automation, etc - are more easily available than Unreal. [Aximmetry Input/Output Control](https://aximmetry.com/learn/virtual-production-workflow/preparation-of-the-production-environment-phase-i/setting-up-inputs-outputs-for-virtual-production/introduction-to-setting-up-inputs-outputs-for-virtual-production/)
- Aximmetry has tools for frame-sync/gen-lock and latency control. [Aximmetry Syncing](https://aximmetry.com/learn/tutorials/for-studio-operators/syncing-and-genlock/)
- Aximmetry can handle multi-machine setups for rendering separate outputs, with *Aximmetry Renderer* software running on Satellite machines. This is a much easier and more customizable setup than Unreal nDisplay. [Aximmetry Multi-Machine Setup](https://aximmetry.com/learn/virtual-production-workflow/preparation-of-the-production-environment-phase-i/multi-machine-environment/multi-machine-setup/)


**Negatives:**
- For full access to infinite SDI input/outputs, as well as tracking solutions (Mars, FIZtrack), the TRL would need the 'Business' license, which would cost ~5000euro at full price. [Aximmetry Pricing](https://aximmetry.com/products)
- It uses a custom fork of Unreal, which would lower accessibility for external TRL uses. [Unreal for Aximmetry](https://aximmetry.com/learn/virtual-production-workflow/preparation-of-the-production-environment-phase-i/obtaining-graphics-and-virtual-assets/creating-content/creating-content-for-aximmetry-de/ue5-how-to-install-and-work-with-the-unreal-engine-based-de-edition/)
- Unreal would have to work in runtime (not in editor mode) for Aximmetry to work. Also, any changes made to the Unreal file would require a re-bake. [Unreal > Aximmetry Data Flow](https://aximmetry.com/learn/virtual-production-workflow/preparation-of-the-production-environment-phase-i/obtaining-graphics-and-virtual-assets/creating-content/creating-content-for-aximmetry-de/passing-data-from-aximmetry-de-to-unreal-engine/)

