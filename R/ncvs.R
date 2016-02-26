## Analysis of NCVS data

library(dplyr)

population <- tbl_df(read.csv("../data/ncvs-personal/NCVS_PERSONAL_POPULATION_2010-2014.csv"))
victims <- tbl_df(read.csv("../data/ncvs-personal/NCVS_PERSONAL_VICTIMIZATION_2010-2014.csv"))

## Return incidents per 1,000 persons
count_to_rate <- function(pop, incidents) {
    data.frame(age=incidents$age,
               rate=apply(
                   merge(incidents, pop, by="age"),
                   1, function(x) { x[2] / x[3] * 1000}))
}

## Total female population
female_pop <- population %>%
    filter(gender == 2 & year == 2014) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))

## Total male population
male_pop <- population %>%
    filter(gender == 1 & year == 2014) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))


## Age breaks are 1 = 12-14, 2 = 15-17, 3 = 18-20, 4 = 21-24, 5 = 25-34,
## 6 = 35-49, 7 = 50-64, 8 = >65,
## based on the tables presented in the NCVS Victimization Analysis Tool.

## Stranger rape, 2014, women, by age
female_stranger_rape <- victims %>%
    filter(gender == 2 & year == 2014 & newoff == 1 & direl == 4) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))

female_stranger_rape_rate <- count_to_rate(female_pop, female_stranger_rape)
round(female_stranger_rape_rate, 2)

## Stranger rape, 2014, men
male_stranger_rape <- victims %>%
    filter(gender == 1 & year == 2014 & newoff == 1 & direl == 4) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))

male_stranger_rape_rate <- count_to_rate(male_pop, male_stranger_rape)
round(male_stranger_rape_rate, 2)

## Acquaintance/partner rape, 2014, women
female_acq_rape <- victims %>%
    filter(gender == 2 & year == 2014 & newoff == 1 & (direl == 1 | direl == 2 | direl == 3)) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))

female_acq_rape_rate <- count_to_rate(female_pop, female_acq_rape)
round(female_acq_rape_rate, 2)

## Acquaintance/partner rape, 2014, men
male_acq_rape <- victims %>%
    filter(gender == 1 & year == 2014 & newoff == 1 & (direl == 1 | direl == 2 | direl == 3)) %>%
    group_by(age) %>%
    summarize(total_weight=sum(weight))

male_acq_rape_rate <- count_to_rate(male_pop, male_acq_rape)
round(male_acq_rape_rate, 2)
