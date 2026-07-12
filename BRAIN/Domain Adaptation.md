# Domain Adaptation & Generalization

## The Generalization Gap
The training dataset (MIMIC-III Boston) represents an unrealistically clean tertiary-care cohort. Our target environment—rural Indonesian clinics (Puskesmas)—presents a massive covariate shift, characterized by lower birth weights, higher prematurity rates, and different clinical base-rates.

## Transductive Transfer Learning Strategy
To resolve this generalization gap, we employ a Transductive Transfer Learning strategy, specifically utilizing Importance-Weighted Empirical Risk Minimization (IWERM). This allows us to "warp" the model's loss function toward target demographics. 

We compute an instance weight $w_i = P_T(x_i)/P_S(x_i)$ for each MIMIC-III sample to align the objective function:
$$\mathcal{L}^{(t)} = \sum_{i=1}^{n_S} w_i \left[ g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i) \right] + \Omega(f_t)$$

## Density Ratio Estimation Frameworks
To estimate the density ratio without requiring labeled target data, we utilize two frameworks:
1. **Kernel Mean Matching (KMM)**: Matches mean embeddings in a Reproducing Kernel Hilbert Space (RKHS) to minimize Maximum Mean Discrepancy (MMD) between cohorts. This non-parametrically aligns multi-sensor distributions (weight, length, HR, SpO₂, temp).
2. **KL Importance Estimation Procedure (KLIEP)**: Minimizes KL divergence and uses Likelihood Cross-Validation (LCV) to optimize the Gaussian kernel width $\sigma$ objectively on unlabeled target profiles.

## Marginal Ratio Approximation (MRA) using SKI 2023 Stats
If target profiles $X_T$ are not yet gathered, we construct the target bivariate density $P_T(\text{BW}, \text{GA})$ (Birth Weight, Gestational Age) using the **Survei Kesehatan Indonesia (SKI) 2023** and Kemenkes national statistics:
$$P_T(\text{BW}, \text{GA}) \sim \mathcal{N}(\mu_T, \Sigma_T), \quad \mu_T = \begin{bmatrix} 3080\text{g} \\ 38.2\text{ wk} \end{bmatrix}, \quad \Sigma_T = \begin{bmatrix} 450^2 & 708.75 \\ 708.75 & 2.1^2 \end{bmatrix}$$

Dividing this by the GMM-estimated source distribution $P_S(\text{BW}, \text{GA})$ downweights extremely low birth weight infants (whose survival in Boston depended on NICU technology) and upweights moderately compromised term and late-preterm infants typical of Puskesmas triage decisions.
