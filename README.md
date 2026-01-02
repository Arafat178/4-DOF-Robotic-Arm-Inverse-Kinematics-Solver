# 4-DOF Robotic Arm Inverse Kinematics (IK) Solver

![Language](https://img.shields.io/badge/Language-JavaScript%20%7C%20HTML5-yellow)
![Domain](https://img.shields.io/badge/Domain-Robotics%20%26%20Automation-blue)
![Status](https://img.shields.io/badge/Status-Active-success)

## Abstract

This project is a web-based simulation tool designed to solve and visualize the **Inverse Kinematics (IK)** of a 4-Degree-of-Freedom (4-DOF) robotic arm. Unlike Forward Kinematics, where joint angles determine the end-effector position, this system calculates the required joint angles ($\theta_1, \theta_2, \theta_3, \theta_4$) to reach a specific target coordinate $(X, Y, Z)$ with a specific wrist orientation ($\alpha$).

The solver utilizes a **geometric analytical approach**, decoupling the base rotation from the planar arm movement, making it computationally efficient and suitable for real-time control applications.

---

## Kinematic Model & Theory

The robot is modeled as a serial manipulator with four revolute joints. The solution is derived by breaking the 3D space problem into two 2D planar problems.

### 1. Base Rotation ($\theta_1$)
The base rotation aligns the arm plane with the target vector. It is calculated using the top-down geometric projection:
$$\theta_1 = \text{atan2}(Y, X)$$

### 2. Wrist Center Calculation
To solve for the elbow and shoulder angles, we first determine the position of the **Wrist Center** ($W_r, W_z$). This decouples the end-effector orientation (controlled by $\alpha$) from the positional arm links.
$$W_r = \sqrt{X^2 + Y^2} - L_4 \sin(\alpha)$$
$$W_z = (Z - L_1) + L_4 \cos(\alpha)$$

### 3. Planar Two-Link IK ($\theta_2, \theta_3$)
Using the **Law of Cosines** on the triangle formed by $L_2$, $L_3$, and the distance to the wrist center ($d$):
* **Elbow Angle ($\theta_3$):** Derived from the inner angle of the triangle.
* **Shoulder Angle ($\theta_2$):** Derived by combining the angle to the wrist center and the offset angle required to close the kinematic chain.

---

##  Features

* **Real-Time Computation:** Instantly calculates joint angles as input parameters change.
* **Dynamic Visualization:**
    * **Top View:** Visualizes the Base rotation and X-Y plane alignment using HTML5 Canvas.
    * **Side View:** Visualizes the planar linkage ($L_2, L_3, L_4$) movements in the vertical plane.
* **Reachability Check:** Automatically detects if a target coordinate is physically unreachable (Singularity/Out of Bounds) and alerts the user.
* **Parametric Design:** Users can modify link lengths ($L_1, L_2, L_3, L_4$) to simulate different robot arm configurations.
* **Theory Integration:** Includes a built-in modal explaining the mathematical formulas used for calculations.

---

## Tech Stack

* **Frontend Structure:** HTML5
* **Styling:** CSS3 (Flexbox/Grid, Responsive Design)
* **Logic & Math:** Vanilla JavaScript (ES6+)
* **Rendering:** HTML5 Canvas API (2D Context)

---

##  Project Structure

├── index.html    # Main user interface and structure
├── style.css     # Styling, layouts, and visual feedback logic
├── script.js     # IK algorithms, canvas drawing logic, and event listeners
└── README.md     # Project documentation

---
##  Operation

1. Input desired Target Coordinates (X, Y, Z).
2. Adjust the Wrist Angle (Alpha).
3. Observe the calculated Joint Angles and the visual simulation.

---
## Author
Arafat Hossain
Mechanical Engineering Student


