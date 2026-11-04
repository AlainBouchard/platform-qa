import { MachineBuilderPage } from '../pages/machine-builder.page';
import { test as designTest } from './design.fixture';

type MachineBuilderFixtures = {
  builder: MachineBuilderPage;
};

export const test = designTest.extend<MachineBuilderFixtures>({
  builder: async ({ page, design }, use) => {
    const builder = new MachineBuilderPage(page);
    await builder.open(design.id);
    await use(builder);
  },
});

export { expect } from './design.fixture';
