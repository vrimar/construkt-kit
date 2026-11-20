# Third-party notices

`@construkt-kit/ui` includes code adapted from the open-source projects below. Each entry names the
release and commit the code was ported from, the files it went into, and that project's licence.

## Base UI

- Source: https://github.com/mui/base-ui, release `v1.9.0`, commit `ad7ecda5296b0295b41a51ecb01fce6204acd099`
- Ported from `packages/react/src/use-render/`, `merge-props/`, `internals/useRenderElement.tsx`,
  `internals/getStateAttributesProps.ts` and `packages/utils/src/useMergedRefs.ts`
- Into `src/primitives/render/`
- Ported from `packages/react/src/internals/useTransitionStatus.ts` and `internals/useAnimationsFinished.ts`
- Into `src/primitives/presence/usePresence.ts`
- Ported from `packages/react/src/floating-ui-react/hooks/useDismiss.ts` (outside presses that start inside, and
  presses on a scrollbar)
- Into `src/primitives/layer/layerStack.ts`
- Ported from `packages/utils/src/store/Store.ts` and `useStore.ts`
- Into `src/primitives/store/`
- Ported from `packages/react/src/internals/composite/list/CompositeList.tsx`, `internals/composite/composite.ts`,
  `floating-ui-react/utils/composite.ts`, `floating-ui-react/hooks/useListNavigation.ts` and `useTypeahead.ts`
- Into `src/primitives/composite/`
- Ported from `packages/react/src/drawer/root/useDrawerSnapPoints.ts` and `drawer/viewport/DrawerViewport.tsx`
  (snap point offsets, overshoot damping, the scroll edges a touch swipe yields to)
- Into `src/components/Drawer/drawerSwipe.ts`
- Ported from `packages/react/src/internals/labelable-provider/LabelableProvider.tsx`, `useLabelableId.ts`,
  `useLabel.ts` and `internals/field-root-context/FieldRootContext.ts` (control and label id registration, message
  ids, the field's states), without form validation or form registration
- Into `src/primitives/field/`
- Ported from `packages/react/src/collapsible/panel/useCollapsiblePanel.ts` and `CollapsiblePanel.tsx` (the open
  animation a panel skips when it mounts open or a hidden ancestor shows it again)
- Into `src/components/collapsiblePanel.tsx`
- Ported from `packages/react/src/scroll-area/root/ScrollAreaRoot.tsx`, `viewport/ScrollAreaViewport.tsx`,
  `scrollbar/ScrollAreaScrollbar.tsx`, `thumb/ScrollAreaThumb.tsx`, `content/ScrollAreaContent.tsx` and
  `utils/getOffset.ts` (thumb drag with pointer capture, track press, wheel over a scrollbar, telling user scrolls from
  scripted ones, viewport and content resize observers)
- Into `src/components/ScrollArea/scrollAreaNode.ts` and `src/components/ScrollArea/ScrollArea.tsx`
- Ported from `packages/react/src/toast/root/ToastRoot.tsx`, `root/ToastRootCssVars.ts` and
  `viewport/ToastViewportCssVars.ts` (swipe to dismiss with its direction lock, damping, threshold and change of mind,
  and the stacking variables)
- Into `src/components/Toast/Toast.tsx` and the toast recipe in `@construkt-kit/preset`

```
MIT License

Copyright (c) 2019 Material-UI SAS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Zag

- Source: https://github.com/chakra-ui/zag, release `1.47.0`, commit `7a415c9d670fd1e3beb653bab242cda7ff9c7304`
- Ported from `packages/utilities/i18n-utils/src/is-rtl.ts`
- Into `src/primitives/locale/index.ts`
- Ported from `packages/utilities/dom-query/src/tabbable.ts` and `initial-focus.ts`
- Into `src/primitives/focus/tabbable.ts`
- Ported from `packages/utilities/popper/src/get-placement.ts`, `middleware.ts` and `get-styles.ts`
- Into `src/primitives/position/usePosition.ts` and the arrow styles in `@construkt-kit/preset`
- Ported from `packages/machines/tooltip/src/tooltip.machine.ts` and `tooltip.store.ts`
- Into `src/components/Tooltip/tooltipStore.ts`
- Ported from `packages/utilities/dom-query/src/typeahead.ts` and `searchable.ts`
- Into `src/primitives/composite/Typeahead.ts`
- Ported from `packages/machines/menu/src/menu.machine.ts`, `menu.connect.ts`, `menu.dom.ts` and `menu.utils.ts`
- Into `src/components/Menu/menuNode.ts` and `src/components/Menu/Menu.tsx`
- Ported from `packages/utilities/rect-utils/src/polygon.ts`
- Into `src/components/Menu/pointerGrace.ts`
- Ported from `packages/machines/listbox/src/listbox.machine.ts`, `listbox.connect.ts` and
  `packages/utilities/collection/src/selection.ts` and `list-collection.ts` (range selection, group order)
- Into `src/components/Listbox/listboxNode.ts`, `src/components/Listbox/Listbox.tsx` and
  `src/components/Listbox/useSelectionController.ts`
- Ported from `packages/machines/combobox/src/combobox.machine.ts`, `combobox.connect.ts` and
  `packages/utilities/live-region/src/index.ts`
- Into `src/components/Combobox/Combobox.tsx`, `src/components/Combobox/Announcer.tsx` and
  `src/hooks/useLiveRegion.tsx`
- Ported from `packages/machines/tree-view/src/tree-view.machine.ts`, `tree-view.connect.ts`,
  `utils/checked-state.ts`, `utils/expand-branch.ts` and `packages/utilities/collection/src/tree-collection.ts`
  and `tree-visit.ts`
- Into `src/components/Tree/treeViewNode.ts`, `src/components/Tree/TreeView.tsx` and
  `src/components/Tree/treeCollection.ts`
- Ported from `packages/machines/drawer/src/utils/drawer-session.ts`, `utils/session.ts` and `utils/snap-point.ts`
  (release velocity, the snap point or close a release lands on, drag-exempt targets)
- Into `src/components/Drawer/drawerSwipe.ts`
- Ported from `packages/utilities/dom-query/src/form.ts` (form reset, a disabled fieldset, the input event a
  script-set value fires)
- Into `src/primitives/field/useFormControl.ts` and `src/primitives/field/inputValueEvent.ts`
- Ported from `packages/machines/checkbox/src/checkbox.machine.ts`, `checkbox.connect.ts` and
  `packages/machines/switch/src/switch.connect.ts`
- Into `src/components/checkable.tsx`
- Ported from `packages/machines/radio-group/src/radio-group.machine.ts`, `radio-group.connect.ts` and
  `radio-group.dom.ts`
- Into `src/components/radioGroup.tsx`
- Ported from `packages/utilities/auto-resize/src/autoresize-textarea.ts`
- Into `src/components/Input/autoresize.ts`
- Ported from `packages/machines/number-input/src/number-input.machine.ts`, `number-input.connect.ts`,
  `number-input.dom.ts`, `number-input.utils.ts`, `cursor.ts` and `packages/utilities/core/src/number.ts`
- Into `src/components/NumberInput/useNumberInput.ts`, `src/components/NumberInput/cursor.ts`,
  `src/components/NumberInput/scrubber.ts` and `src/components/numberMath.ts`
- Ported from `packages/machines/slider/src/slider.machine.ts`, `slider.connect.ts`, `slider.dom.ts`,
  `slider.style.ts`, `slider.utils.ts` and `packages/utilities/dom-query/src/event.ts` (`getEventStepValue`)
- Into `src/components/Slider/useSlider.ts`, `src/components/Slider/sliderMath.ts` and `src/components/numberMath.ts`
- Ported from `packages/utilities/dom-query/src/pointer-move.ts` and `text-selection.ts`
- Into `src/primitives/drag/trackPointerMove.ts`
- Ported from `packages/machines/pin-input/src/pin-input.machine.ts`, `pin-input.connect.ts` and `pin-input.utils.ts`
- Into `src/components/PinInput/usePinInput.ts`
- Ported from `packages/machines/tags-input/src/tags-input.machine.ts`, `tags-input.connect.ts`, `tags-input.utils.ts`
  and `tags-input.translations.ts`, `packages/utilities/auto-resize/src/autoresize-input.ts` and `visual-style.ts`,
  and the outside-press and focus-outside rules of `packages/utilities/interact-outside/src/index.ts`
- Into `src/components/TagsInput/useTagsInput.ts` and `src/components/TagsInput/autoresizeInput.ts`
- Ported from `packages/machines/editable/src/editable.machine.ts` and `editable.connect.ts`
- Into `src/components/Editable/index.tsx`
- Ported from `packages/machines/rating-group/src/rating-group.machine.ts`, `rating-group.connect.ts` and
  `rating-group.dom.ts`
- Into `src/components/RatingGroup/index.tsx`
- Ported from `packages/machines/tabs/src/tabs.machine.ts`, `tabs.connect.ts`, `tabs.dom.ts` and
  `packages/utilities/dom-query/src/event.ts` (`isOpeningInNewTab`)
- Into `src/components/Tabs/index.tsx`
- Ported from `packages/machines/toggle-group/src/toggle-group.machine.ts`, `toggle-group.connect.ts` and
  `toggle-group.dom.ts`
- Into `src/components/ToggleGroup/index.tsx`
- Ported from `packages/machines/radio-group/src/radio-group.connect.ts` (the segment parts and indicator)
- Into `src/components/SegmentGroup/index.tsx`
- Ported from `packages/machines/collapsible/src/collapsible.machine.ts`, `collapsible.connect.ts`,
  `packages/machines/accordion/src/accordion.machine.ts`, `accordion.connect.ts` and `accordion.dom.ts`
- Into `src/components/collapsiblePanel.tsx`, `src/components/Collapsible/index.tsx` and
  `src/components/Accordion/index.tsx`
- Ported from `packages/machines/file-upload/src/file-upload.machine.ts`, `file-upload.connect.ts`,
  `file-upload.utils.ts` and `file-upload.dom.ts`, `packages/utilities/file-utils/src/data-transfer.ts`,
  `get-accept-attr.ts`, `is-valid-file-type.ts`, `get-file-mime-type.ts`, `mime-types.ts`, `is-valid-file-size.ts`,
  `is-file-equal.ts` and `types.ts`, and `packages/utilities/i18n-utils/src/format-bytes.ts`
- Into `src/components/FileUpload/fileUploadRoot.ts`, `src/components/FileUpload/FileUpload.tsx` and
  `src/components/FileUpload/fileUtils.ts`
- Ported from `packages/machines/clipboard/src/clipboard.machine.ts`, `clipboard.connect.ts` and `clipboard.dom.ts`
- Into `src/components/Clipboard/index.tsx` and `src/components/Clipboard/copyText.ts`
- Ported from `packages/machines/avatar/src/avatar.machine.ts` and `avatar.connect.ts`
- Into `src/components/Avatar/index.tsx`
- Ported from `packages/machines/progress/src/progress.machine.ts` and `progress.connect.ts`
- Into `src/components/Progress/index.tsx`
- Ported from `packages/machines/pagination/src/pagination.machine.ts`, `pagination.connect.ts` and
  `pagination.utils.ts`
- Into `src/components/Pagination/index.tsx` and `src/components/Pagination/pageRange.ts`
- Ported from `packages/utilities/highlight-word/src/highlight.ts`, `highlight-multiple.ts`, `highlight-first.ts`,
  `normalize-span.ts`, `escape-regex.ts` and `whole-word.ts`
- Into `src/components/Highlight/highlightWord.ts`
- Ported from `packages/machines/date-picker/src/date-picker.machine.ts`, `date-picker.connect.ts`,
  `date-picker.dom.ts` and `date-picker.utils.ts`, and `packages/utilities/date-utils/src/align.ts`, `assertion.ts`,
  `constrain.ts`, `date-month.ts`, `date-year.ts`, `duration.ts`, `format.ts`, `formatter.ts`, `get-era-format.ts`,
  `mutation.ts`, `pagination.ts` and `preset.ts`
- Into `src/components/DatePicker/useCalendar.ts`, `src/components/DatePicker/dateUtils.ts` and
  `src/components/DatePicker/calendarRoot.tsx`
- Ported from `packages/machines/color-picker/src/color-picker.machine.ts`, `color-picker.connect.ts`,
  `color-picker.dom.ts`, `utils/get-channel-display-color.ts`, `utils/get-channel-input-value.ts`,
  `utils/get-slider-background.ts` and `utils/is-valid-hex.ts`, and `packages/utilities/color-utils/src/area-gradient.ts`
  and `color-format-gradient.ts`
- Into `src/components/ColorPicker/ColorPicker.tsx`, `src/components/ColorPicker/colorPickerRoot.ts` and
  `src/components/ColorPicker/pickerColors.ts`
- Ported from `packages/machines/scroll-area/src/scroll-area.machine.ts`, `scroll-area.connect.ts`,
  `utils/scroll-sides.ts` and `utils/scroll-offset.ts` (thumb size and offset, corner size, overflow and edge state,
  the overflow variables)
- Into `src/components/ScrollArea/scrollAreaNode.ts` and `src/components/ScrollArea/ScrollArea.tsx`
- Ported from `packages/machines/carousel/src/carousel.machine.ts`, `carousel.connect.ts` and `carousel.dom.ts`,
  `packages/utilities/scroll-snap/src/index.ts` (itself modified from https://github.com/LachlanArthur/scroll-snap-api,
  MIT) and `packages/utilities/dom-query/src/scale.ts`
- Into `src/components/Carousel/carouselRoot.ts`, `src/components/Carousel/scrollSnap.ts` and
  `src/components/Carousel/index.tsx`
- Ported from `packages/machines/toast/src/toast.store.ts`, `toast-group.machine.ts`, `toast-group.connect.ts`,
  `toast.machine.ts`, `toast.connect.ts`, `toast.utils.ts` and `toast.dom.ts` (the queue and its priorities, promise
  toasts, durations, pause on hover, focus and a hidden page, the stacked and expanded layouts and their hover areas,
  focus return, the hotkey, height measuring)
- Into `src/components/Toast/toastStore.ts`, `src/components/Toast/Toast.tsx` and the toast recipe in
  `@construkt-kit/preset`

```
MIT License

Copyright (c) 2021 Chakra UI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## React Aria

- Source: https://github.com/adobe/react-spectrum, release `react-aria-components@1.22.0`, commit
  `1abc52dd5ad238143f168912963ff3ad932547a4`
- Ported from `packages/react-aria/src/overlays/usePreventScroll.ts` and `utils/platform.ts`, `utils/isScrollable.ts`,
  `utils/getScrollParent.ts`, `utils/domHelpers.ts` and `utils/getMetaValue.ts`, without the `focus()` override and
  the keyboard blur handling
- Into `src/primitives/scroll-lock/useScrollLock.ts`, which carries a notice that it was changed

```
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
```

```
                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2019 Adobe

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
```
