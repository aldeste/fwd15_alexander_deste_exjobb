// @flow
import chalk from "chalk";
import { toGlobalId } from "graphql-relay";
import { Person, Planet } from "../data";
import ProgressBar from "progress";

export default async function generateMockData(
  forceInsert: boolean = false,
  useProgressBar: boolean = false
): Promise<void> {
  if (forceInsert || (await Person.count()) === 0) {
    const { peopleDummy, planetsDummy } = require("./dummy");
    const isKnown = val => (val === "unknown" ? null : val);

    console.log();
    const bar: null | ProgressBar =
      useProgressBar &&
      new ProgressBar("Initiating database  :bar :percent :current/:total", {
        complete: "█",
        incomplete: "░",
        clear: true,
        total: peopleDummy.length * 2 + planetsDummy.length * 2
      });

    // Fill the database with dymmy people
    await Promise.all(
      peopleDummy.map((person: Object, index: number) => {
        bar && bar.tick(1);
        return Person.create({
          ...person,
          id: null,
          token: toGlobalId("people", index + 1),
          password: "password",
          hairColor: person.hair_color,
          mass: isKnown(person.mass) && parseInt(person.mass, 10),
          height: isKnown(person.height),
          skinColor: person.skin_color,
          eyeColor: person.eye_color,
          birthYear: person.birth_year
        });
      })
    );

    // Fill the database with dymmy planets
    await Promise.all(
      planetsDummy.map((planet: Object) => {
        bar && bar.tick(1);
        return Planet.create({
          ...planet,
          id: null,
          climates: planet.climate,
          population: isKnown(planet.population) &&
            parseInt(planet.population, 10),
          terrains: planet.terrain,
          diameter: isKnown(planet.diameter),
          orbitalPeriod: isKnown(planet.orbital_period),
          rotationPeriod: isKnown(planet.rotation_period),
          surfaceWater: isKnown(planet.surface_water)
        });
      })
    );

    // Associate homeworld to each user.
    await Promise.all(
      peopleDummy.map(async ({ name, homeworld: home }, index) => {
        bar && bar.tick(1);
        const currentPerson = await Person.findOne({ where: { name } });
        const planet = planetsDummy.find(planet => planet.id === home);
        const homeworld =
          planet && (await Planet.findOne({ where: { name: planet.name } }));

        return currentPerson.setHomeworld(homeworld);
      })
    );

    // Associate habitants to each planet
    await Promise.all(
      planetsDummy.map(async ({ name, residents }, index) => {
        bar && bar.tick(1);
        const currentPlanet = await Planet.findOne({ where: { name } });
        const planetsResidents = peopleDummy
          .filter(person => residents.includes(person.id))
          .map(resident => resident.name);

        if (!planetsResidents.length) return;

        const residentsInDb = await Person.findAll({
          where: { name: planetsResidents }
        });

        return currentPlanet.addResidents(residentsInDb);
      })
    );

    return console.log(
      chalk.green.bold(
        "All fields and connections have been inserted in database"
      )
    );
  }
  return console.log(chalk.yellow.bold("Fields already in database, have fun"));
}