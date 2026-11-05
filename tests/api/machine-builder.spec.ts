import { addParts, Part } from '../../api/machine-builder.api';
import { expect, test } from '../../fixtures/design.fixture';

test('a disposable design has an id and a name that starts with QA disposable', ({
  design,
}) => {
  expect(design.id).toBeTruthy();
  expect(design.name).toMatch(/^QA disposable \d+$/);
});

test('adding 1 MachineMotion AI and 2 MachineMotion AI Pro lists those quantities on the bill of materials', async ({
  design,
  request,
}) => {
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
