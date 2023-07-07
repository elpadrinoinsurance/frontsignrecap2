import { useEffect, useRef } from 'react';
import { Form, Viewer, Template, Designer } from '@pdfme/ui';
import { cloneDeep } from './helper'

export const useForm = (props: {
  formRef: React.MutableRefObject<HTMLDivElement|null>;
  template: Template;
}) => {
  const { formRef, template } = props;
  const form = useRef<Form | null>(null);

  useEffect(() => {
    if (formRef.current && form.current === null) {
      form.current = new Form({
        domContainer: formRef.current,
        template,
        inputs: [{}]
      });
    } else if(form.current !== null) {
      form.current.updateTemplate(template);
      form.current.setInputs([{}]);
    }
  }, [formRef.current, template]);

  return form.current;
};

export const useViewer = (props: {
  viewerRef: React.MutableRefObject<HTMLDivElement|null>;
  template: Template;
  inputs: Record<string,string>[]
}) => {
  const { viewerRef, template, inputs } = props;
  const viewer = useRef<Viewer | null>(null);

  useEffect(() => {
    if (viewerRef.current && viewer.current === null) {
      viewer.current = new Viewer({
        domContainer: viewerRef.current,
        template,
        inputs,
      });
    } else {
      viewer.current?.updateTemplate(template);
      viewer.current?.setInputs(inputs);
    }
  }, [viewerRef.current, template, inputs]);

  return viewer.current;
};

export const useDesigner = (props: {
  designerRef: React.MutableRefObject<HTMLDivElement|null>;
  template: Template;
}) => {
  const { designerRef, template } = props;
  const designer = useRef<Designer | null>(null);

  useEffect(() => {
    if (designerRef.current && designer.current === null) {
      designer.current = new Designer({
        domContainer: designerRef.current,
        template
      });
    } else {
      designer.current?.updateTemplate(template);
    }
  }, [designerRef.current, template]);
  return designer.current;
};
