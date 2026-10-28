import { addParts, Part } from '../../api/machine-builder.api';
import { expect, test } from '../../fixtures/design.fixture';

test('create and delete a design', ({ design }) => {
  expect(design.id).toBeTruthy();
  expect(design.name).toMatch(/^QA disposable \d+$/);
});

test('adds catalog parts to a design', async ({ design, request }) => {
  const price = await addParts(request, design.id, {
    machineMotionAi: 1,
    machineMotionAiPro: 2,
  });
  expect(price.bom).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        part_number: Part.machineMotionAi.partNumber,
        name: Part.machineMotionAi.name,
        quantity: 1,
      }),
      expect.objectContaining({
        part_number: Part.machineMotionAiPro.partNumber,
        name: Part.machineMotionAiPro.name,
        quantity: 2,
      }),
    ]),
  );
});
